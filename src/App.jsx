import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addComment, deleteComment } from "./redux/commentSlice";
import { selectComments } from "./redux/selectors";
import "./App.css";

const schema = yup.object().shape({
  comment: yup
    .string()
    .required("Veuillez rédiger un commentaire sur le film")
    .max(500),
  note: yup
    .mixed()
    .oneOf(["1", "2", "3", "4", "5"], "Veuillez sélectionner une note")
    .required("Veuillez sélectionner une note"),
  acceptConditions: yup
    .boolean()
    .oneOf([true], "Vous devez accepter les conditions générales"),
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      comment: "",
      note: "",
      acceptConditions: false,
    },
  });

  useEffect(() => {
    async function fetchMovie() {
      try {
        const response = await fetch("https://jsonfakery.com/movies/random/1");
        const data = await response.json();
        setMovie(data[0]);
      } catch (error) {
        console.error("Erreur lors de la récupération du film", error);
        setError("Erreur lors de la récupération du film");
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    const newComment = {
      id: Date.now(),
      comment: data.comment,
      note: parseInt(data.note),
    };
    dispatch(addComment(newComment));
    reset();
  };

  if (error) return <p>Erreur : {error}</p>;
  if (loading) return <p>Chargement...</p>;

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {movie && (
            <Card className="mb-4">
              <Card.Img
                variant="top"
                src={movie.poster_path}
                className="moviePoster"
              />
              <Card.Body>
                <Card.Title>{movie.original_title}</Card.Title>
                <Card.Text>
                  <small>
                    Sortie le{" "}
                    {new Date(movie.release_date).toLocaleDateString("fr-FR")}
                  </small>
                  <br />
                  Note moyenne : {movie.vote_average} ({movie.vote_count} votes)
                </Card.Text>
                <Card.Text>{movie.overview}</Card.Text>
              </Card.Body>
            </Card>
          )}

          <h4>Commentaires</h4>
          <Form onSubmit={handleSubmit(onSubmit)} className="mb-3">
            <Form.Group className="mb-3" controlId="comment">
              <Form.Label>Ajouter un commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("comment")}
                isInvalid={!!errors.comment}
              />
              <Form.Control.Feedback type="invalid">
                {errors.comment?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="note">
              <Form.Label>Note</Form.Label>
              <Form.Select {...register("note")} isInvalid={!!errors.note}>
                <option value="">Sélectionnez une note</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.note?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="acceptConditions">
              <Form.Check
                type="checkbox"
                label="J'accepte les conditions générales"
                {...register("acceptConditions")}
                isInvalid={!!errors.acceptConditions}
                feedback={errors.acceptConditions?.message}
                feedbackType="invalid"
              />
            </Form.Group>

            <Button type="submit">Ajouter</Button>
          </Form>

          {comments.length === 0 ? (
            <Alert variant="info">Aucun commentaire pour le moment.</Alert>
          ) : (
            comments.map((c) => (
              <Card className="mb-2" key={c.id}>
                <Card.Body>
                  <Card.Title>Note : {c.note}/5</Card.Title>
                  <Card.Text>{c.comment}</Card.Text>
                  <Button
                    variant="danger"
                    onClick={() => dispatch(deleteComment(c.id))}
                  >
                    Supprimer
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;

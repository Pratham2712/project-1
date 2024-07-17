import React, { useEffect, useState } from "react";
import {
  checkCommentThunk,
  commentThunk,
  editCommentThunk,
  getBookDetailThunk,
} from "../redux/slices/bookPageSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";

import {
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  Rating,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Login from "./Login";
import { SUCCESS } from "../constants/constants";

const BookPage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ type: false, msg: "" });
  const [state, setState] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;
  const [expanded, setExpanded] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  //useSelector
  const loading = useSelector(
    (state) => state.rootReducer.bookPageSlice.loading
  );
  const data = useSelector(
    (state) => state.rootReducer.bookPageSlice.data.detail
  );
  const wordsArray = data?.description?.split(" ");
  const maxWords = 70;
  const displayText = expanded
    ? data?.description
    : wordsArray?.slice(0, maxWords).join(" ");
  const userComment = useSelector(
    (state) => state.rootReducer.bookPageSlice.data.comment[0]
  );
  const [rate, setRate] = useState(userComment?.rating || 0);
  const [text, setText] = useState(userComment?.comment || "");
  const isLogin = useSelector(
    (state) => state.rootReducer.UserInfoSlice.isLogin
  );
  const date = new Date(data.publishedDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  //useEffect
  useEffect(() => {
    const data = {
      book_id: id,
    };
    dispatch(getBookDetailThunk(data));
  }, []);
  useEffect(() => {
    setRate(userComment?.rating);
    setText(userComment?.comment);
    setValue("rating", userComment?.rating);
    setValue("comment", userComment?.comment);
  }, [userComment]);
  useEffect(() => {
    const data = {
      bookId: id,
    };
    dispatch(checkCommentThunk(data));
  }, [isLogin]);

  //schema
  const schema = yup.object().shape({
    comment: yup.string(),
    // .min(5, "comment must contain 3 letters")
    // .max(50, "comment cannot exceed 50 letters"),
    rating: yup.number(),
  });
  console.log(text, rate);
  //useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      comment: userComment?.comment,
      rating: userComment?.rating,
    },
  });

  //function
  const handleBlur = async (e) => {
    await trigger(e.target.name);
  };

  const onSubmit = (data) => {
    const info = {
      comment: data?.comment,
      rating: data?.rating,
      bookId: id,
    };
    if (!isLogin) {
      return setLoginOpen(!loginOpen);
    } else {
      if (!userComment && (data?.comment || data?.rating)) {
        dispatch(commentThunk(info)).then((data) => {
          if (data.payload.type === SUCCESS) {
            dispatch(checkCommentThunk({ bookId: id }));
            setSuccessMsg((prevSuccessMsg) => ({
              ...prevSuccessMsg,
              type: true,
              msg: "Comment posted successfully",
            }));
          }
        });
      } else {
        if (
          (userComment?.comment != data?.comment ||
            userComment?.rating != data?.rating) &&
          (data?.comment || data?.rating)
        ) {
          dispatch(editCommentThunk(info)).then((data) => {
            console.log(data.payload.type);
            if (data.payload.type === SUCCESS) {
              dispatch(checkCommentThunk({ bookId: id }));
              setSuccessMsg((prevSuccessMsg) => ({
                ...prevSuccessMsg,
                type: true,
                msg: "Comment edited successfully",
              }));
            }
          });
        }
      }
    }
  };
  return (
    <Box sx={{ paddingTop: "3rem", overflowY: "auto" }}>
      <Snackbar
        open={successMsg.type}
        anchorOrigin={{ vertical, horizontal }}
        autoHideDuration={2000}
        onClose={() => {
          setSuccessMsg((prevSuccessMsg) => ({
            ...prevSuccessMsg,
            type: false,
            msg: "",
          }));
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => {
            setSuccessMsg((prevSuccessMsg) => ({
              ...prevSuccessMsg,
              type: false,
              msg: "",
            }));
          }}
          sx={{ width: "100%" }}
        >
          {successMsg.msg}
        </Alert>
      </Snackbar>
      <Navbar />
      {loading ? (
        <Box sx={{ width: "100%", height: "100vh", position: "absolute" }}>
          <LinearProgress
            color="inherit"
            sx={{ top: "30%", zIndex: "100", width: "30%", left: "35%" }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "0rem 3rem",
            height: "100vh",
          }}
        >
          <Box sx={{ marginRight: "2rem" }}>
            <img
              style={{ width: "400px", height: "500px", paddingTop: "3rem" }}
              src={data?.cover?.[0]}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              paddingTop: "2rem",
            }}
          >
            <Typography variant="h4">{data?.title}</Typography>
            <Typography sx={{ heigth: "2 rem" }}>
              {displayText}
              {!expanded && wordsArray?.length > maxWords && (
                <span
                  onClick={() => setExpanded(!expanded)}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  &nbsp;... Read more
                </span>
              )}
              {expanded && (
                <span
                  onClick={() => setExpanded(!expanded)}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  &nbsp; Show less
                </span>
              )}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-around" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">Published Date : </Typography>
                <Typography sx={{ paddingTop: "0.2rem" }}>
                  {formattedDate}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">Language : </Typography>
                <Typography sx={{ paddingTop: "0.2rem" }}>
                  {data?.language}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ marginBottom: "0.5rem" }}>
                <Typography>Review</Typography>
                <span>
                  <Rating
                    size="large"
                    {...register("rating")}
                    onBlur={handleBlur}
                    value={rate}
                    onChange={(event, newValue) => {
                      setValue("rating", newValue);
                      trigger("rating");
                      setRate(newValue);
                    }}
                  />
                </span>
              </Box>
              <Box>
                <TextField
                  id="outlined-multiline-flexible"
                  label={userComment?.comment ? "" : "Comment"}
                  name="comment"
                  multiline
                  rows={4}
                  size="large"
                  sx={{ width: "50%" }}
                  {...register("comment")}
                  onBlur={handleBlur}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setValue("comment", e.target.value);
                    trigger("comment");
                  }}
                />
                <Typography sx={{ height: "1.5rem", fontSize: "0.8rem" }}>
                  <ErrorMessage
                    errors={errors}
                    name="comment"
                    render={({ message }) => (
                      <span style={{ color: "maroon" }}>{message}</span>
                    )}
                  />
                </Typography>
              </Box>
              <Button
                sx={{
                  background: "#000814",
                  border: "2px solid #000814",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "#000814",
                    border: "2px solid #000814",
                  },
                }}
                variant="contained"
                onClick={handleSubmit(onSubmit)}
              >
                {userComment?.comment || userComment?.rating ? "Edit" : "Post"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <Button
        sx={{
          background: "#000814",
          border: "2px solid #000814",
          fontWeight: "bold",
          marginLeft: "2.5rem",
          "&:hover": {
            backgroundColor: "white",
            color: "#000814",
            border: "2px solid #000814",
          },
        }}
        variant="contained"
        //onClick={handleSubmit(onSubmit)}
      >
        All Comments
      </Button>
      <Divider />
      <Login loginOpen={loginOpen} setLoginOpen={setLoginOpen}></Login>
    </Box>
  );
};

export default BookPage;

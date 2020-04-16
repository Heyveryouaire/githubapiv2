import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

import { classes as cls, View } from "tw";

import Input from "./form/Input";
import Button from "./form/Button";
import FlashBox from "./form/FlashBox";

export function TicketBase({
  classes,
  onSubmit,
  submissionError,
  clearSubmissionError,
  submissionLoading
}) {
  classes = classes || {};
  classes.container = classes.container || [];
  classes.control = classes.control || [];
  classes.label = classes.label || [];
  classes.input = classes.input || [];
  classes.helper = classes.helper || [];
  classes.forgottenText = classes.forgottenText || [];

  // const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  // const fgtPasswd = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    clearError
  } = useForm();
  const { 
        label: labelValue,
        date: dateValue,
        project: projectValue,
        body: bodyValue
     } = getValues();

  // const onLabelSubmit = useCallback(() => {
  //   passwordRef.current.focus();
  // }, [passwordRef.current]);

  const onPasswordSubmit = useCallback(
    data => {
      onSubmit(data);
    },
    [handleSubmit]
  );

  // Here we add the post data
  useEffect(() => {
    register("label", {
      required: `Un label est requis`
    });
    register("date", {
      required: "Une date est requise"
    });
    register("project", {
      required: "Un projet est requis"
    })
    register("body", {
      required: "Une description est requise"
    })
  }, [register]);

  const submit = useMemo(() => handleSubmit(onPasswordSubmit), [
    handleSubmit,
    onPasswordSubmit,
  ]);

  const navigation = useNavigation();

  useEffect(() => {
    const listener = navigation.addListener("focus", () => {
      setValue("label", "");
      setValue("date", "");
      setValue("project", "")
      setValue("body", "")
      clearError();
      clearSubmissionError();
    });

    return () => navigation.removeListener("focus", listener);
  }, [navigation]);

  useEffect(() => {
    const listener = navigation.addListener("blur", () => {
      setValue("label", "");
      setValue("date", "");
      setValue("project", "")
      setValue("body", "")
      clearError();
      clearSubmissionError();
    });

    return () => navigation.removeListener("blur", listener);
  }, [navigation]);

  return (
    <View style={[...cls`justify-center items-center`, ...classes.container]}>
      <View style={cls`w-full`}>
        {/* Ca s'affiche, mais ca marche, damn */}
        {submissionError && (
          <FlashBox.Error>
            Impossible d'envoyer votre ticket
          </FlashBox.Error>
        )}
        <Input
          autoFocus
          classes={classes}
          label="Label"
          placeholder="Problème, fonctionnalité, urgent"
          value={labelValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("label", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.label && errors.label.message}
        />
        <Input
          classes={classes}
          label="Date"
          placeholder="Date de changement souhaitée"
          value={dateValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("date", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.date && errors.date.message}
        />
        <Input
          classes={classes}
          label="Project"
          placeholder="Selectionner le projet"
          value={projectValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("project", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.project && errors.project.message}
        />
        {/* Useless password, user musyt be already connected anyway*/}
        <Input
          classes={classes}
          label="Description"
          placeholder="Ajouter une description"
          value={bodyValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("body", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.body && errors.body.message}
        />
        {/* <Input
          classes={classes}
          label="Insérer un fichier"
          placeholder=".jpg, .png, .zip .."
          value={passwordValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("password", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.username && errors.password.message}
          inputRef={passwordRef}
        /> */}
        <View style={cls`w-full`}>
          <Button
            onPress={!submissionLoading && submit}
            disabled={submissionLoading}
            loading={submissionLoading}
          >
            Envoyer le ticket
          </Button>
        </View>
      </View>
    </View>
  );
}

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker'

import { classes as cls, View } from "tw";

import Input from "./form/Input";
import Button from "./form/Button";
import FlashBox from "./form/FlashBox";
import Radio from "./form/Radio"

export function TicketBase({
  classes,
  onSubmit,
  submissionError,
  clearSubmissionError,
  submissionLoading,
  success
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
  const [radio, setRadio] = useState(null)
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
        body: bodyValue,
        file: fileValue
        // radio: radioValue
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
    register("fileValue", {})
    // register("radio", {
    //   required : "Il faut un projet"
    // })
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
  // console.log(submissionError)
  return (
    <View style={[...cls`justify-center items-center`, ...classes.container]}>
      <View style={cls`w-full`}>
        {submissionError && (
          <FlashBox.Error>
            Impossible d'envoyer votre ticket
          </FlashBox.Error>
        )}
        {success && (
          <FlashBox.Success>
            Votre ticket à bien été transmis !
          </FlashBox.Success>
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
          // onSubmitEditing={submit}
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
          // onSubmitEditing={submit}
          error={errors && errors.date && errors.date.message}
        />
          <Radio.Group 
            value={projectValue} 
            onValueChange={value => {
              clearError();
              clearSubmissionError();
              setValue("project", value);
            }}
            // onSubmitEditing={submit}
            error={errors && errors.project && errors.project.message}
          >
            <Radio.Button value="graphql2" label="Graphql2"></Radio.Button>
            <Radio.Button value="boum" label="Boum"></Radio.Button>
          </Radio.Group>

        {/* <Input
          classes={classes}
          label="Project"
          placeholder="Selectionner le projet (graphql2)"
          value={projectValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("project", value);
          }}
          // onSubmitEditing={submit}
          error={errors && errors.project && errors.project.message}
        /> */}
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
          // onSubmitEditing={submit}
          error={errors && errors.body && errors.body.message}
        />

        <Button
        value={fileValue}
          onPress={ async () => {
            const path = await DocumentPicker.getDocumentAsync({})
            setValue("fileValue", path)
          }
        }
         
        >
          Choisir un fichier
        </Button>
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

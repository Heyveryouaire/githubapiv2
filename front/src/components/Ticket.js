import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker'

import { classes as cls, View } from "tw";

import Input from "./form/Input";
import Button from "./form/Button";
import FlashBox from "./form/FlashBox";
import Radio from "./form/Radio"
import Stack from "./layout/Stack"
import { Title } from "../components/typography"
import Api from "../lib/api"

export function TicketBase({
  classes,
  onSubmit,
  submissionError,
  clearSubmissionError,
  submissionLoading,
  success,
}) {
  classes = classes || {};
  classes.container = classes.container || [];
  classes.control = classes.control || [];
  classes.label = classes.label || [];
  classes.input = classes.input || [];
  classes.helper = classes.helper || [];
  classes.forgottenText = classes.forgottenText || [];

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    clearError,
    watch
  } = useForm();

  const labelValue = watch("label")
  const dateValue = watch("date")
  const projectValue = watch("project")
  const bodyValue = watch("body")
  const fileValue = watch("file")

  const onPasswordSubmit = useCallback(
    data => {
      onSubmit(data);
    },
    [handleSubmit]
  );

  const [ repo, setRepos ] = useState(null)
  useEffect(() => {
    console.log('effect loaded')
    async function repoSet() {
      setRepos(await getRepos())
    }
    repoSet()
  }, [])

  const getRepos = async () => {
    console.log("launched")
    return await Api.getRepositories()
  }

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
      <Stack vertical style={cls`w-full sm:w-full md:w-full lg:w-2/3 xl:w-2/3`}>
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
        <Title style={cls`text-center sm:text-center md:text-center lg:text-left xl:text-left text-white`}>Créer un ticket</Title>


          { repo && (
              <Radio.Group
              value={projectValue}
              onValueChange={value => {
                clearError();
                clearSubmissionError();
                setValue("project", value);
              }}
              // onSubmitEditing={submit}
              error={errors && errors.project && errors.project.message}
              style={cls`flex`}
              >     
              { repo.results.map((repo, index) => {
                return (
                  <Radio.Button key={index} value={repo.name} label={repo.name}></Radio.Button>
                  )
                })}
              </Radio.Group>
          )} 

        <Stack horizontal style={cls`m4`} ></Stack>

        <Input
          autoFocus
          classes={classes}
          label="Titre"
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
        <Stack horizontal style={cls`m4`} ></Stack>

        <Stack horizontal style={cls`w-1/6 text-center py-4`}
        >
          <Button
            value={fileValue}
            onPress={async () => {
              const path = await DocumentPicker.getDocumentAsync({})
              setValue("fileValue", path)
            }
            }
          >
            Choisir un fichier
        </Button>
        <Stack horizontal style={cls`m8`} ></Stack>
        </Stack>
        <Stack horizontal style={cls`m4`} ></Stack>

          <Stack horizontal style={cls`py-4 my-4 text-center justify-center`}>

          <Button
          color="green-600"
            onPress={!submissionLoading && submit}
            disabled={submissionLoading}
            loading={submissionLoading}
            >
            Envoyer le ticket
          </Button>
            </Stack>

      </Stack>
    </View>
  );
}

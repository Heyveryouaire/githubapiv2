import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

import { classes as cls, View } from "tw";

import Input from "./form/Input";
import Button from "./form/Button";
import FlashBox from "./form/FlashBox";
import Stack from "./layout/Stack";
import { Title } from "../components/typography"

export function ProfilBase({
  classes,
  onSubmit,
  submissionError,
  clearSubmissionError,
  submissionLoading,
  success,
  profilUser
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
        lastname: nomValue,
        firstname: prenomValue,
        company: companyValue,
        email: emailValue,
        phone: phoneValue
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

  // Here we add the post
  useEffect(() => {
    register("lastname", {required: "Champ obligatoire", minLength: { value: 2, message : "Le champ est trop court"} , pattern:{ value: /^[a-zA-Z]{2,50}$/, message: "Le champ n'est pas valide"}});
    register("firstname", {required: "Champ obligatoire", minLength: { value: 2, message : "Le champ est trop court"} , pattern:{ value: /^[a-zA-Z]{2,50}$/, message: "Le champ n'est pas valide"}});
    register("email", {required: "Champ obligatoire", minLength: { value: 8, message : "Le champ est trop court"}, pattern:{ value: /^([a-z0-9]{1,}.?_?){3,}[a-z0-9]{1,}@[a-z]{2,6}.[a-z]{2,6}$/, message: "Le format n'est pas valide"}})
    register("company", {required: "Champ obligatoire", minLength: { value: 2, message : "Le champ est trop court"}})
    register("phone",{ required: "Champ obligatoire", minLength: { value: 10, message : "Le champ est trop court"}, pattern : {value: /^([0-9]{2}){5}$/, message: "Le format n'est pas valide"}})
  }, [register]);

  const submit = useMemo(() => handleSubmit(onPasswordSubmit), [
    handleSubmit,
    onPasswordSubmit,
  ]);

  const navigation = useNavigation();

  useEffect(() => {
    const listener = navigation.addListener("focus", () => {
      setValue("lastname", profilUser.lastname);
      setValue("firstname", profilUser.firstname);
      setValue("company", profilUser.company)
      setValue("email", profilUser.email)
      setValue("phone", profilUser.phone)
      clearError();
      clearSubmissionError();
    });

    return () => navigation.removeListener("focus", listener);
  }, [navigation]);

  useEffect(() => {
    const listener = navigation.addListener("blur", () => {
      setValue("lastname", profilUser.lastname);
      setValue("firstname", profilUser.firstname);
      setValue("company", profilUser.company)
      setValue("email", profilUser.email)
      setValue("phone", profilUser.phone)
      clearError();
      clearSubmissionError();
    });

    return () => navigation.removeListener("blur", listener);
  }, [navigation]);

  return ( 
   
    <View style={[...cls`justify-center items-center w-full`, ...classes.container]}>

      <Stack vertical style={cls`w-2/3`}>

      {/* <View style={cls`w-full`}> */}
        {/* Ca s'affiche, mais ca marche, damn */}
        {submissionError && (
          <FlashBox.Error>
            Impossible de modifier votre profil
          </FlashBox.Error>
        )}
        {success && (
          <FlashBox.Success>
            Votre profil à bien été mis à jour !
          </FlashBox.Success>
        )}

        <Title style={cls`text-white`}>Mon profil</Title>
        <Input
          autoFocus
          classes={classes}
          label="Nom"
          placeholder="Nom"
          value={nomValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("lastname", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.lastname && errors.lastname.message}
          // error={errors && errors.nom && errors.nom.message}
        />
        <Input
          classes={classes}
          label="Prénom"
          placeholder="Prénom"
          value={prenomValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("firstname", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.firstname && errors.firstname.message}
        />
        <Input
          classes={classes}
          label="Société"
          placeholder="Nom de votre société"
          value={companyValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("company", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.company && errors.company.message}
        />
        {/* Useless password, user musyt be already connected anyway*/}
        <Input
          classes={classes}
          label="E-mail"
          placeholder="Adresse e-mail"
          value={emailValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("email", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.email && errors.email.message}
        />
        <Input
          classes={classes}
          label="Numéro de téléphone"
          placeholder="Numéro de téléphone"
          value={phoneValue}
          onValueChange={value => {
            clearError();
            clearSubmissionError();
            setValue("phone", value);
          }}
          onSubmitEditing={submit}
          error={errors && errors.phone && errors.phone.message}
        />
        <View style={cls`w-full`}>
          <Button
            onPress={!submissionLoading && submit}
            disabled={submissionLoading}
            loading={submissionLoading}
          >
            Modifier votre profil
          </Button>
        </View>
      </Stack>
      </View>

  );
}

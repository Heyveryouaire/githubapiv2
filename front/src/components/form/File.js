import React from 'react'
import { TextInput, View, Text } from "react-native"


export default function File({
    classes,
    label,
    placeholder
}){

    const { value, onChangeText } = React.useState("UselessPlaceholder")

   

    return(

        <View>
            {label && <Text> {label} </Text>}

        <TextInput
            onChangeText={text => onChangeText(text)}
            value={value}
            placeholder={placeholder}
            classes={classes}
            />

            </View>
    )
}
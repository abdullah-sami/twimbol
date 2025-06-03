import { StyleSheet, Text, View, Image, TextInput } from 'react-native'
import React from 'react'

import { icons } from '@/constants/icons'
import { useRouter } from "expo-router";

import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';


const searchBar  = ({placeholder, value, onChangeText}:{placeholder:string, value:string, onChangeText:(text:string)=>void}) => {
    
    const navigation = useNavigation();
  return (
        <>
        <View style={styles.search_bar} className='bg-accent'>
            
        <TextInput 
            autoFocus={true}
            style={styles.search_input}
            placeholder={placeholder}
            placeholderTextColor={"#000000"}
            value={value}
            onPress={()=>{}}
            onChangeText={onChangeText}
            className="flex-1 ml-2 text-accent"
            

            />
        <View style={[styles.search_icon_box]}>
            <Image
            
                source={icons.search}
                style={[styles.search_icon, { tintColor: "#fff" }]}
                
                />
        </View>
        </View>
        </>
  )
}



const styles = StyleSheet.create({
    search_bar:{
        margin: "auto",
        marginTop: 30,
        width: "80%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 50,
        overflow: 'hidden',
        outline: 'none',
        alignItems: 'center',
    },
    search_input: {
        borderStartStartRadius: 50,
        width: "80%",
        height: 40,
        borderColor: '#fff',
        borderWidth: 1,
        paddingHorizontal: 15,
        color: '#000', 
        outline: 'none',
        backgroundColor: '#F0F0F0'
    },
    search_icon_box: {
        width: "12%",
        height: 38,
        paddingLeft: 5,
        paddingRight: 15,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6E42',

      },
    search_icon:{
        width: 20,
        height: 20,
        paddingRight: 5,
                

    }
})



export default searchBar
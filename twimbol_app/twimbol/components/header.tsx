import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Link from "expo-router/link";
import React from "react";
import { router, Stack, useNavigation, useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import profile from "@/app/profile";




const Header = () => {

  const router = useRouter();
  const navigation = useNavigation();

    return (
<View className="android:elevation-7 w-100 h-20  bg-white flex-row justify-space-between align-center shadow-lg">
        <Image
          source={images.logo}  
          style={styles.logo}
          className="ml-5"
        />

        <View style={styles.header_menu}>

          <View style={styles.header_icon_container}>
          <Link href="../search" style={{color: "#fff"}}>
            <View style={styles.header_icon_link}>
              <Image
                source={icons.search}
                style={[styles.header_icon, { tintColor: "#fff" }]}
              />
            </View>
          </Link>
          </View>

          <View style={styles.header_icon_container}>
            
          <Link href="../notifications" style={{color: "#fff"}}>
          
          <View style={styles.header_icon_link}>
            <Image
              source={icons.notification}
              style={styles.header_icon}
              tintColor={"#fff"}
            />
          </View>
            </Link>
          </View>
          <View style={styles.header_icon_container}>
            <TouchableOpacity
              onPress={() => navigation.navigate('profile' as never)}>
            <View style={styles.header_icon_link}>
            <Image
              source={icons.profile}
              style={styles.profile_icon}
              tintColor={"#fff"}
              
            />
            </View>
            </TouchableOpacity>
            
          </View>
        </View>
      </View>
  );

}







const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 60,
    marginLeft: 10,
    padding: 30,
    marginTop: 10,
    resizeMode: "contain",
  },
  header_icon_container: {
    width: 40,
    height: 40,
    backgroundColor: "#FF6E42",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 10,

  },
  header_menu: {
    flexDirection: "row",
    position: "absolute",
    right: 0,
  },
  header_icon: {
    width: 20,
    height: 20,
    borderRadius: 50,
    resizeMode: "contain",
  },
  header_icon_link: {
    
  },
  profile_icon: {
    width: 30,
    height: 30,
    borderRadius: 50,
    resizeMode: "contain",
  }
});










export default Header











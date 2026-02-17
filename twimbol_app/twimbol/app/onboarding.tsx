import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import Link from "expo-router/link";
import React from 'react'
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants/images';
import SwiperFlatList from 'react-native-swiper-flatlist';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
const {width} = Dimensions.get('window')

const onboarding = () => {

  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const card1_banner = images.safeinternet
  const card2_wisher1 = images.wisher1
  const card2_wisher2 = images.wisher2
  const card2_wisher3 = images.wisher3

  return (
    <SafeAreaView className='bg-white flex-1'>

    <Image source={images.logo} style={styles.logo} />

    <SwiperFlatList
      autoplay
      autoplayDelay={3}
      autoplayLoop
      index={0}
      showPagination
      paginationStyle={{position: 'absolute', bottom: 180, left: 0, right: 0, zIndex: 100}}
      paginationActiveColor={'#FF6E42'}
      paginationStyleItemActive={{width: 30, height: 10, borderRadius: 50}}
      paginationStyleItem={{width: 10, height: 10, borderRadius: 50}}
      paginationDefaultColor={'#FF6E42'}
      style={{width: width}}

      

      data={onboardingcards}
      renderItem={({item}) => (

        item.id==1? (<>
        <View className='flex-1 justify-center items-center bg-white' style={styles.card_wrapper}>
          <View className='flex-1 justify-center items-center bg-white' style={styles.card}>
            <Text style={styles.card_title}>{item.title}</Text>
            <View  style={styles.card1_banner_container} className='flex-1 justify-center items-center overflow-hidden'>
            <Image source={card1_banner} className='' resizeMode='contain' style={styles.card1_banner}/>
            </View>
            <Text className='text-textPrimary text-md' style={styles.card1_desc}>{item.desc}</Text>
          </View>
          </View>
          </>



        ) : item.id==2?(



          <>
        <View className='flex-1 justify-center items-center bg-white' style={styles.card_wrapper}>
          <View className='flex-1 justify-center items-center bg-white' style={styles.card}>
            <Text className='text-2xl font-bold' style={styles.card_title} >{item.title}</Text>

              <View className='flex-column justify-between items-center mt-5 '>
                <View style={styles.card2_wisher}>
                  <View style={styles.card2_wisher_img_container}>
                    <Image source={card2_wisher1} style={styles.card2_wisher_img} />
                    <Text style={styles.card2_wisher_name}>{item.wisher[0].name}</Text>
                    <Text style={styles.card2_wisher_des}>{item.wisher[0].des}</Text>
                  </View>
                  
                  <View style={styles.card2_wisher_det}>
                    <Text style={styles.card2_wisher_msg}>"{item.wisher[0].msg}"</Text>
                    
                  </View>
                </View>

                <View style={styles.card2_wisher} className='ml-5'>
                  <View style={styles.card2_wisher_img_container}>
                    <Image source={card2_wisher2} style={styles.card2_wisher_img} />
                    <Text style={styles.card2_wisher_name}>{item.wisher[1].name}</Text>
                    <Text style={styles.card2_wisher_des}>{item.wisher[1].des}</Text>
                  </View>
                  
                  <View style={styles.card2_wisher_det}>
                    <Text style={styles.card2_wisher_msg}>"{item.wisher[1].msg}"</Text>
                    
                  </View>
                </View>

                <View style={styles.card2_wisher}>
                  <View style={styles.card2_wisher_img_container}>
                    <Image source={card2_wisher3} style={styles.card2_wisher_img} />
                    <Text style={styles.card2_wisher_name} className='pt-15'>{item.wisher[2].name}</Text>
                    <Text style={styles.card2_wisher_des}>{item.wisher[2].des}</Text>
                  </View>
                  
                  <View style={styles.card2_wisher_det}>
                    <Text style={styles.card2_wisher_msg}>"{item.wisher[2].msg}"</Text>
                    
                  </View>
                </View>

              </View>
          </View>
          </View>
          </>
        ):(<></>)

      )}


    />

    
<View style={styles.join_now_cont}>
    <Text
      style={styles.join_now}
      onPress={() => navigation.navigate('authentication', {authpage: 'login'})}
    >
      Join Now!
    </Text>
  </View>
    

    </SafeAreaView>)
}

export default onboarding

const styles = StyleSheet.create({
  logo:{
    width: 200,
    height: 90,
    alignSelf: 'center',
    marginVertical: 50,
  },
  card_wrapper:{
    width: width,
    height: 390,
    // overflow: 'hidden',

  },
  card:{
    width: width-40,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 5,


  },
  card_title:{
    fontSize: 25,
    color: '#000',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card1_banner_container:{
    width: '90%',
    height: 140,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  card1_banner:{
    width: '100%',
  },
  card1_desc:{
    padding: 15,
    paddingBottom: 20,
    textAlign: 'justify',
  },







  card2_wisher: {
    flexDirection: 'row',
    backgroundColor: '#FFECD9',
    borderRadius: 15,
    padding: 5,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,




  },
  card2_wisher_img_container: {
    width: 100,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'flex-end',
  },
  card2_wisher_img: {
    width: 53,
    height: 53,
    resizeMode: 'cover',
    borderRadius: 50,
    position: 'absolute',
    top: -25,
    borderColor: '#fff',
    borderWidth: 2,
  },
  card2_wisher_det: {
    flex: 1,
    justifyContent: 'center'
  },
  card2_wisher_msg: {
    fontSize: 13,
    fontWeight: '300',
    marginBottom: 12,
    color: '#222',
  },
  card2_wisher_name: {
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginTop: 25,
  },
  card2_wisher_des: {
    fontSize: 10,
    color: '#444',
    textAlign: 'center',
  },













  join_now_cont:{
    height: 500,
    width: 530,
    backgroundColor: '#FF6E42',
    borderRadius: "50%",
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -330,
    right: -130,
    elevation: 5,
    shadowColor: '#000',
  },

  join_now:{
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    position: 'absolute',
    top: 50,
    left: 100,
  }








})









const onboardingcards = [
  {id: 1, title: "Raise Your Voice", desc: "Let's build a safe and halal internet where children grow with knowledge and purity, not confusion and harm. Join this dawah to protect young hearts and shape a brighter, guided future online."},
  {id: 2, title: "What our well-wishers say:", wisher: [
  {name: "Antu Kareem", des: "Actor & Entrepreneur", img: images.wisher1, msg: "Twimbol is a great initiative for children. We welcome Twimbol's efforts in promoting safe technology use for kids. "},
  {name: "Nafees Salim", des: "Content Creator", img: images.wisher2, msg: "I believe this is a wonderful initiative that will raise awareness among children and parents. "},
  {name: "Mabrur Rashid Banna", des: "Drama Director", img: images.wisher3, msg: " A truly commendable effort. I hope this becomes a wonderful initiative for both children and parents. "}
  ]}
  ];



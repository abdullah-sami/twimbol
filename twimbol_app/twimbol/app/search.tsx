import { StyleSheet, Text, View, TextInput, Image, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import SearchBar from '@/components/searchBar'
import { icons } from '@/constants/icons'
import { ScrollView, GestureHandlerRootView, FlatList } from 'react-native-gesture-handler'
import useFetch from '@/services/useFetch'
import { fetchSearchResults } from '@/services/api'
import SearchResult from "@/components/search_result";
import { images } from '@/constants/images'
import { SafeAreaView } from 'react-native-safe-area-context'

const search = () => {

  const [searchQuery, setsearchQuery] = useState('')


  const { data: searchresults, loading, error, refetch: loadsearchresults, reset } = useFetch(() =>
    fetchSearchResults({
      query: searchQuery
    }), false

  )


  useEffect(() => {
    const timeoutId = setTimeout(async () => {

      if (searchQuery.trim()) {
        await loadsearchresults();
      }
      else {
        reset()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)

  }, [searchQuery])




  // const [searchresults, setSearchResults]= useState()
  const [searchhistory, setSearchHistory] = useState()
  return (

    <GestureHandlerRootView className="flex-1">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>


        <View style={styles.search_page}>






          <FlatList
            showsVerticalScrollIndicator={false}
            data={searchresults}
            renderItem={({ item }) => (


              <>
                <SearchResult post_id={item.id} video_data={item.video_data} reels_data={item.reels_data} post_title={item.post_title} post_by={item.user_profile} username={item.username} post_type={item.post_type} created_at={item.created_at} post_description={item.post_description} post_banner={item.post_banner} />
              </>
            )}




            keyExtractor={(item) => item.id.toString()}

            numColumns={1}
            scrollEnabled={true}

            ListHeaderComponent={<>
              <SearchBar placeholder={"Search for posts..."} value={searchQuery} onChangeText={(text: string) => setsearchQuery(text)} />

              {loading && (
                <ActivityIndicator
                  size="large" color="#FF6E42" className='my-3' />

              )}

              {error && (
                <Text className='text-red-500 px-5 my-3'>
                  Error: {error.message}
                </Text>
              )}


              {!loading && !error && searchQuery.trim() && searchresults && searchresults.length > 0 && (
                <View style={styles.searchresultheader} className='flex-1'>
                  <Text >Showing results for: "{searchQuery}"</Text>
                </View>
              )}

              {!loading && !error && searchQuery.trim() && searchresults && searchresults.length == 0 && (
                <>
                  <Image style={styles.not_found} source={icons.page_error} className='' tintColor={"#c2767e"} />
                  {/* <Image style={styles.not_found} source={icons.s404} className='' tintColor={"#c2767e"}/> */}
                  <View style={styles.searchresultheader} className='flex-1'>
                    <Text >Didn't find anything!</Text>
                  </View></>
              )}


              {!loading && !error && !searchQuery.trim() && (
                <View style={styles.searchresultheader} className='flex-1'>
                  <Text >Search for something...</Text>
                </View>
              )}




            </>
            }

          />


        </View>
      </SafeAreaView>
    </GestureHandlerRootView>

  )
}

export default search

const styles = StyleSheet.create({
  searchresultheader: {
    fontSize: 10,
    color: '#010101',
    margin: 'auto',
    padding: 10,
  },
  search_page: {
    height: "100%",
    backgroundColor: "#fff",
  },
  not_found: {
    marginTop: 100,
    width: 100,
    height: 100,
    marginHorizontal: 'auto'


  },
  search_history: {

  },

})
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'


const TimeAgo = ({time_string}:any) => {
    
    const yourDate = new Date(time_string);
    const now = new Date();
    
    const diffMs = now - yourDate; 
    const diffMins = Math.floor(diffMs / 60000); 
    
    let timeAgo = "";
    
    if (diffMins < 1) {
      timeAgo = "Just now";
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeAgo = `${hours} hours ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeAgo = `${days} days ago`;
    }
    
  
    return (
      <Text>{timeAgo}</Text>
  )
}

export default TimeAgo

const styles = StyleSheet.create({})







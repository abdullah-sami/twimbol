import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ImageBackground, Image, View } from 'react-native';
import { images } from '@/constants/images';






import IndexScreen from '@/app/(tabs)/index';
import CreateScreen from '@/app/(tabs)/create';
import EventScreen from '@/app/(tabs)/event';
import PostScreen from '@/app/(tabs)/posts';
import WatchScreen from '@/app/(tabs)/watch';






const Tab = createBottomTabNavigator();

// Dummy icons object (replace with your real icons object)
import { icons } from '@/constants/icons';

const TabIcon = ({ focused, icon }: { focused: boolean; icon: any }) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.accentbgfortabicon}
        style={{
          minWidth: 44,
          width: 44,
          height: 40,
          minHeight: 40,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          flex: 1,
          borderBottomLeftRadius: 10, 
          borderBottomRightRadius: 10, 
          elevation: 3,

        }}
      >
        <Image
          source={icon}
          tintColor="#ffffff"
          style={{
            minWidth: 20,
            width: 28,
            height: 28,
            minHeight: 20,
            marginTop: 4,
            position: 'absolute',
            top: 0,
            alignSelf: 'center',
          }}
        />
      </ImageBackground>
    );
  } else {
    return (
      <View
        style={{
          marginTop: 10,
          minWidth: 48,
          width: 44,
          height: 60,
          minHeight: 48,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={icon}
          tintColor="#151312"
          style={{
            minWidth: 20,
            width: 32,
            height: 32,
            minHeight: 20,
            marginTop: 4,
          }}
        />
      </View>
    );
  }
};

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: '100%',
          width: '100%',
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        component={IndexScreen}
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} />,
        }}
      />
      <Tab.Screen
        component={PostScreen}
        name="posts"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.post} />,
        }}
      />
      {/* <Tab.Screen
        component={WatchScreen}
        name="watch"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.video} />,
        }}
      /> */}
      <Tab.Screen
        component={CreateScreen}
        name="create"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.creator} />,
        }}
      />
      {/* <Tab.Screen
        component={EventScreen}
        name="event"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.event} />,
        }}
      /> */}
    </Tab.Navigator>
  );
}

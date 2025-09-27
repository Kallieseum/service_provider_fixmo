// app/AppNavigator.tsx
import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

// Import screens
import HomeScreen from "../../app/provider/onboarding/pre_homepage";
import CalendarScreen from "../../app/provider/integration/calendarscreen";
import MessagesScreen from "../../app/provider/integration/messagescreen";
import ProfileScreen from "../../app/provider/onboarding/providerprofile";
import ChatList from "../../app/provider/integration/chatlist";
import EnRouteScreen from "../../app/provider/integration/enroutescreen";   // ✅ add
import MessageScreen from "../../app/provider/integration/messagescreen";  // ✅ add

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs (Provider flow)
const ProviderTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarActiveTintColor: "#000", // active = black
                tabBarInactiveTintColor: "#666", // inactive = gray
                tabBarShowLabel: false, // hide labels, icons only
                tabBarStyle: {
                    backgroundColor: "#d3d3d3", // straight gray bar
                    borderTopWidth: 0,
                    height: 60,
                },
                tabBarIcon: ({color}) => {
                    let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

                    if (route.name === "Home") {
                        iconName = "home-outline";
                    } else if (route.name === "Calendar") {
                        iconName = "calendar-outline";
                    } else if (route.name === "Messages") {
                        iconName = "chatbubble-ellipses-outline";
                    } else if (route.name === "Profile") {
                        iconName = "person-outline";
                    }

                    return <Ionicons name={iconName} size={22} color={color}/>;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="Calendar" component={CalendarScreen}/>
            <Tab.Screen name="Messages" component={MessagesScreen}/>
            <Tab.Screen name="Profile" component={ProfileScreen}/>
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                {/* Initial landing (pre_homepage) */}
                <Stack.Screen name="Homepage" component={HomeScreen}/>

                {/* Provider Tabs (with Calendar, Messages, Profile) */}
                <Stack.Screen name="ProviderTabs" component={ProviderTabs}/>

                {/* ChatList, opened when selecting a chat from Messages */}
                <Stack.Screen name="ChatList" component={ChatList}/>

                {/* ✅ Add En Route screen */}
                <Stack.Screen name="EnRouteScreen" component={EnRouteScreen}/>

                {/* ✅ Add direct Message screen (chat UI) */}
                <Stack.Screen name="MessageScreen" component={MessageScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

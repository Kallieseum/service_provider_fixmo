import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

import TodaySchedule from "../../app/provider/onboarding/today-schedule";
import CalendarScreen from "../../app/calendar/calendarscreen";
import ChatList from "../../app/messaging/chatlist";
import providerprofile from "../../app/profile/providerprofile";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="TodaySched" component={TodaySchedule}/>
            <Tab.Screen name="Calendar" component={CalendarScreen}/>
            <Tab.Screen name="ChatList" component={ChatList}/>
            <Tab.Screen name="Providerprofile" component={providerprofile}/>

        </Tab.Navigator>
    );
}

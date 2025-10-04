import React from "react";
import {View, StyleSheet} from "react-native";
import BottomTabs from "../navigation/BottomTabs";

type TabKey = "home" | "task" | "calendar" | "messages" | "myservices" | "profile" | "chat";

type ApprovedScreenWrapperProps = {
    activeTab: TabKey;
    children: React.ReactNode;
    isApproved?: boolean; // optional, defaults to true
};

export default function ApprovedScreenWrapper({
                                                  activeTab,
                                                  children,
                                                  isApproved = true,
                                              }: ApprovedScreenWrapperProps) {
    return (
        <View style={styles.screen}>
            <View style={styles.content}>{children}</View>
            <BottomTabs activeTab={activeTab} isApproved={isApproved}/>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: "#fff"},
    content: {flex: 1},
});

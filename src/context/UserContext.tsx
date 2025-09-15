import React, {createContext, useContext, useState, useEffect} from 'react';

export type User = {
    name: string;
    phone: string;
    status: 'active' | 'pending' | 'approved' | 'denied';
};

export type Notification = {
    id: number;
    title: string;
    body: string;
    read: boolean;
    type?: 'welcome' | 'booking' | 'approval' | 'system' | 'denied';
    createdAt: string; // ⏱ timestamp
};

const defaultUser: User = {
    name: '',
    phone: '',
    status: 'pending',
};

const UserContext = createContext<{
    user: User;
    setUser: (user: User) => void;
    notifications: Notification[];
    archivedNotifications: Notification[];
    notificationCount: number;
    addNotification: (notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAllAsRead: () => void;
    cleanUpNotifications: () => void;
}>({
    user: defaultUser,
    setUser: () => {
    },
    notifications: [],
    archivedNotifications: [],
    notificationCount: 0,
    addNotification: () => {
    },
    markAllAsRead: () => {
    },
    cleanUpNotifications: () => {
    },
});

export const UserProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(defaultUser);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([]);

    // 👋 Insert personalized welcome notification
    useEffect(() => {
        if (user.name && notifications.length === 0 && user.status === 'pending') {
            setNotifications([
                {
                    id: 1,
                    title: 'Welcome to FixMo!',
                    body: `Hi ${user.name}, thanks for joining 🎉`,
                    type: 'welcome',
                    read: false,
                    createdAt: new Date().toISOString(),
                },
            ]);
        }
    }, [user]);

    // ❌ Denied notification
    useEffect(() => {
        if (user.status === 'denied') {
            addNotification({
                title: 'Application Denied',
                body: `Hi ${user.name || 'Provider'}, your documents were denied. You can submit a new application after 7 days.`,
                type: 'denied',
            });
        }
    }, [user.status]);

    const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        setNotifications(prev => [
            ...prev,
            {
                id: prev.length + archivedNotifications.length + 1,
                ...notif,
                read: false,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    // 🧹 Cleanup: archive >3 months, delete >1 year
    const cleanUpNotifications = () => {
        const now = new Date();
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        setNotifications(prev => {
            const stillActive: Notification[] = [];
            const toArchive: Notification[] = [];

            prev.forEach(n => {
                const created = new Date(n.createdAt);
                if (created < oneYearAgo) {
                    // ❌ older than 1 year → remove completely
                    return;
                } else if (created < threeMonthsAgo) {
                    // 📦 older than 3 months but < 1 year → archive
                    toArchive.push(n);
                } else {
                    stillActive.push(n);
                }
            });

            if (toArchive.length > 0) {
                setArchivedNotifications(prevArchived => [...toArchive, ...prevArchived]);
            }

            return stillActive;
        });
    };

    // 🕒 Run cleanup every app start
    useEffect(() => {
        cleanUpNotifications();
    }, []);

    const notificationCount = notifications.filter(n => !n.read).length;

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                notifications,
                archivedNotifications,
                notificationCount,
                addNotification,
                markAllAsRead,
                cleanUpNotifications,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);

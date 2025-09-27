import React, {createContext, useContext, useState, ReactNode} from "react";

type Booking = {
    title: string;
    body: string;
};

type BookingContextType = {
    bookings: Booking[];
    addBooking: (booking: Booking) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({children}: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);

    const addBooking = (booking: Booking) => {
        setBookings((prev) => [...prev, booking]);
    };

    return (
        <BookingContext.Provider value={{bookings, addBooking}}>
            {children}
        </BookingContext.Provider>
    );
};

// ✅ Export hook
export const useBookingContext = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBookingContext must be used inside BookingProvider");
    }
    return context;
};

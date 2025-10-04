export interface Appointment {
    id: string;
    name: string;
    serviceType: string;
    dateTime: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export const scheduledAppointments: Appointment[] = [
    {
        id: '1',
        name: 'Maria de la Cruz',
        serviceType: 'Electrical Repair',
        dateTime: 'June 23, 2025 | 2:00PM',
        status: 'Scheduled',
    },
    {
        id: '2',
        name: 'Juan Santos',
        serviceType: 'Plumbing',
        dateTime: 'June 23, 2025 | 4:30PM',
        status: 'Scheduled',
    },
];
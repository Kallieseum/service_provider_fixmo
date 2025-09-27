// context/JobContext.tsx
import React, {createContext, useState, useContext} from "react";

type Job = {
    id: string;
    name: string;
    service: string;
    time: string;
    location: string;
    status: "pending" | "ongoing" | "completed";
};

type JobContextType = {
    jobs: Job[];
    addJob: (job: Job) => void;
    completeJob: (id: string) => void;
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [jobs, setJobs] = useState<Job[]>([
        {
            id: "1",
            name: "Maria de la Cruz",
            service: "Electrical Repair",
            time: "June 23, 2025 | 2:00PM",
            location: "899 Pureza, Sta. Mesa",
            status: "pending",
        },
    ]);

    const addJob = (job: Job) => {
        setJobs((prev) => [...prev, job]);
    };

    const completeJob = (id: string) => {
        setJobs((prev) =>
            prev.map((job) => (job.id === id ? {...job, status: "completed"} : job))
        );
    };

    return (
        <JobContext.Provider value={{jobs, addJob, completeJob}}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => {
    const context = useContext(JobContext);
    if (!context) throw new Error("useJobs must be used within JobProvider");
    return context;
};

import { backendUrl } from "../../localhostConf";
import { safeFetch } from "./safeFetch";

export const updateMealPopularity = async (meals: any) => {
    try {
        // Fetch data from the backend
        const response = await safeFetch(`${backendUrl}/cjenik/updatePopularity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meals),
        });

        // Check if the response is ok (status 200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response as JSON
        const data = await response.json();

        // Log the data
        console.log("Data from backend:", data);
    } catch (error) {
        // Catch and log errors
        console.error('Error fetching meals:', error);
    }
};


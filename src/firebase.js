import axios from "axios";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

await axios
    .get("http://localhost:8000/")
    .then((res) => {
        const firebaseApp = initializeApp(res.data);
    })
    .catch((error) => {
        console.log(error);
    });

export default getDatabase()
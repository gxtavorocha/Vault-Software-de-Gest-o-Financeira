import styles from "./Caixinhas.module.css";
import { useAppContext } from "../context/AppContext";

export default function Caixinhas() {
     const { theme} = useAppContext();
    return (
        <div className={styles.container}>
            <h1 className={theme === "light" ? styles.textDark : styles.text}>Em breve...</h1>
        </div>
    );
}
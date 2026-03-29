import styles from "./Contas.module.css";
import { useAppContext } from "../context/AppContext";

export default function Contas() {
    const { theme } = useAppContext();
    return (
        <div className={styles.container}>
            <h1 className={theme === "light" ? styles.textDark : styles.text}>Em breve...</h1>
        </div>
    );
}
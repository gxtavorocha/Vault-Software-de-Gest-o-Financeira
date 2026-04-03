import "../styles/login.css";

export default function Login() {
  return (
    <>
      <header>
        <div className="container-logo">
          <img src="/img/1-Photoroom(1).png" alt="Preciffy Logo" />
        </div>
        <nav>
          <ul className="menu">
            <li>
              <a href="#">SOBRE</a>
            </li>
            <li>
              <a href="#">CONTATO</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container">
        <form>
          <h1>
            <img src="/img/1-Photoroom.png" alt="Preciffy" />
          </h1>

          <div className="input-box">
            <input placeholder="Usuário" type="email" />
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-box">
            <input placeholder="Senha" type="password" />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Lembrar minha senha
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>

          <button type="submit" className="login">
            Entrar
          </button>

          <div className="divider">ou</div>

          <div className="register-link">
            <p>
              Não tem uma conta? <a href="#">Cadastre-se</a>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}

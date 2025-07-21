import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {

 useEffect(() => {
  const preventInspect = (e) => {
    if (
      e.key === 'F12' || // F12
      (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
      (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
      (e.ctrlKey && e.key === 'U') // Ctrl+U
    ) {
      e.preventDefault();
    }
  };

  const disableRightClick = (e) => {
    e.preventDefault();
  };

  document.addEventListener("contextmenu", disableRightClick);
  document.addEventListener("keydown", preventInspect);

  return () => {
    document.removeEventListener("contextmenu", disableRightClick);
    document.removeEventListener("keydown", preventInspect);
  };
}, []);


  return <Component {...pageProps} />;
}

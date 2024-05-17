import { useEffect } from "react";
import "./App.css";
import Chat from "./Components/Chat/Chat";
import Details from "./Components/Details/Details";
import List from "./Components/List/List";
import LogIn from "./Components/Login/LogIn";
import { auth } from "./Components/Lib/Firebase";
import { useUserStore } from "./Components/Lib/UserStore";
import { InfinitySpin } from "react-loader-spinner";
import { useChatStore } from "./Components/Lib/ChatStore";

function App() {
  const { currentUser, isLoading, fetchCurrentUser } = useUserStore();
  const { chatId } = useChatStore();
  useEffect(() => {
    const unSub = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCurrentUser(user?.uid);
      } else {
        console.log("No user");
        fetchCurrentUser(null);
      }
    });

    return () => unSub();
  }, []);

  if (isLoading)
    return (
      <div className="w-screen h-screen flex items-center justify-center py-10">
        {" "}
        <InfinitySpin
          visible={true}
          width="200"
          color="white"
          ariaLabel="infinity-spin-loading"
        />
      </div>
    );
  else {
    return (
      <div className="container">
        {currentUser ? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Details />}
          </>
        ) : (
          <LogIn />
        )}
      </div>
    );
  }
}

export default App;

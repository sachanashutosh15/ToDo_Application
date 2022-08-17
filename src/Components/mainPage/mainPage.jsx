import React from "react";
import "./mainPage.css";
import { Link, useNavigate } from "react-router-dom";

export default function MainPage () {
  const navigate = useNavigate();
  const [userData, setUserData] = React.useState("");
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isOngoing, setIsOngoing] = React.useState(false);
  const [newActivity, setNewActivity] = React.useState({
    activityName: "",
    status: "pending",
    Time_taken: 0,
  });
  const serverUrl = "http://localhost:3001";

  function verifyAndGetData() {
    verifyUser();
    if (isAuthorized && !userData) {
      fetch (serverUrl, {
        method: "GET",
        headers: {
          "authorization": `bearer ${localStorage.getItem("token")}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUserData(data.user);
        data.user.todos.forEach(activity => {
          if (activity.status === "ongoing") {
            setIsOngoing(true);
          }
        })
      })
    }
  }

  React.useEffect(() => {
    verifyAndGetData();
  }, [isAuthorized])

  React.useEffect(() => {
    if (newActivity.activityName !== "") {
      handleSubmit(verifyAndGetData);
    }
  }, [newActivity])

  function verifyUser () {
    if (localStorage.getItem("token")) {
      setIsAuthorized(true);
    }
  }

  function handleSubmit() {
    fetch(`${serverUrl}/newtodo`, {
      method: "POST",
      body: JSON.stringify(newActivity),
      headers: {
        "authorization": `bearer ${localStorage.getItem("token")}`,
        "content-type": "application/json",
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.acknowledged){
        setUserData(prevData => ({...prevData, todos: [...prevData.todos, newActivity]}));
      }
      setNewActivity(prevData => ({...prevData, activityName: ""}));
      if (data.error) {
        localStorage.clear();
      }
    });
  }

  function createNewActivity() {
    const activity = prompt("Please enter the activity name");
    if (activity === null) {
      return;
    } else {
      const activityObj = {
        activityName: activity,
        status: "pending",
        Time_taken: 0,
      }
      setNewActivity(activityObj);
    }
  }

  function handleStart (e) {
    console.log(isOngoing);
    if(!isOngoing) {
      const time = Date().toString().split(" ")[4];
      const body = {index: e.target.id, time};
      fetch(`${serverUrl}/todos`, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "authorization": `bearer ${localStorage.getItem("token")}`,
          "content-type": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.result.acknowledged) {
          const newTodos = [...userData.todos];
          newTodos[Number(e.target.id)].status = "ongoing"
          setIsOngoing(true);
          setUserData(prevData => ({...prevData, todos: newTodos }));
        }
        if (data.result.error) {
          localStorage.clear();
          window.location.reload();
        }
      })
    } else {
      alert("One activity is already going on.");
    }
  }

  function endActivity(e) {
    const time = Date().toString().split(" ")[4];
    const body = {index: e.target.attributes.selector.value, end: time };
    fetch (`${serverUrl}/todos_time`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "authorization": `bearer ${localStorage.getItem("token")}`,
        "content-type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.error) {
        localStorage.clear();
        window.location.reload();
      } else if (data.result.acknowledged) {
        console.log(data.userData.todos);
        setIsOngoing(false);
        const newTodos = [...data.userData.todos];
        setUserData(prevData => ({...prevData, todos: newTodos}));
      }
    });
  }

  function pauseResumeActivity(e) {
    let time = Date().toString().split(" ")[4];
    var body;
    if (e.target.innerHTML === "Pause") {
      body = { time: {end: time}, index: e.target.attributes.selector.value };
    } else {
      body = { time: {start: time}, index: e.target.attributes.selector.value };
    }
    fetch(`${serverUrl}/todos_time_PR`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "authorization": `bearer ${localStorage.getItem("token")}`,
        "content-type": "application/json",
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if(data.error) {
        localStorage.clear();
        window.location.reload();
      } else if (data.result.acknowledged){
        const newTodos = [...data.userData.todos];
        setUserData(prevData => ({...prevData, todos: newTodos}));
        if (e.target.innerHTML === "Pause") {
          setIsOngoing(false);
        } else {
          setIsOngoing(true);
        }
      }
    })
  }

  return (
    <>
    { !isAuthorized ?
    <div>
      <h1>Please log in</h1>
      <Link to="/login"><button>Log in page</button></Link>
    </div>:
    <div>
      <div className="main--header" >
        <h2> {userData && userData.userName} </h2>
      </div>
      <div className="main--sidebar" >
        <div>
          <h3 style={{color: "steelblue"}}>To do List</h3>
          <h4>History</h4>
        </div>
        <div>
          <button
            className="logoutbtn"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="newActivity--container">
        <h2
          style={{border: "2px solid red", padding: "0.5rem"}}
          onClick={createNewActivity}
        >
          Add new activity
        </h2>
      </div>
      <div className="main--content">
        <table className="content-table">
            <tr>
              <th>Activity</th>
              <th>Status</th>
              <th>Time taken</th>
              <th>Action</th>
            </tr>
          {
           userData && userData.todos.map((todo, i) => (
           <tr key={i} id={i}>
              <td>{todo.activityName}</td>
              <td>{todo.status}</td>
              <td>
                {(function (){
                  if (todo.status === "completed") {
                    let timeInterval = 0;
                    for (let i = 0; i < todo.times.length; i += 2) {
                      let t2 = todo.times[i + 1].end.split(":").map(a => Number(a));
                      let t1 = todo.times[i].start.split(":").map(a => Number(a));
                      let t2_t1 = (t2[0] - t1[0]) * 3600 + (t2[1] - t1[1]) * 60 + (t2[2] - t1[2]);
                      timeInterval += t2_t1;
                    }
                    let ss =  (timeInterval % 60 + "").padStart(2, 0);
                    timeInterval -= timeInterval % 60;
                    let mm = ((timeInterval % 3600) / 60 + "").padStart(2, 0);
                    timeInterval -= timeInterval % 3600;
                    let hh = ((timeInterval) / 3600 + "").padStart(2, 0);
                    return hh + ":" + mm + ":" + ss;
                  }
                }())}
              </td>
              {(function() {
                switch (todo.status) {
                  case "pending":
                    return (
                      <td>
                        <span
                          className="action-button"
                          onClick={handleStart}
                          id={ i }
                        >
                          Start
                        </span>
                      </td>
                    )
                  case "completed":
                    return (
                      <td>
                      </td>     
                    )
                  case "ongoing":
                    return (
                      <td>
                        <span
                          className="action-button"
                          selector={ i }
                          onClick={ endActivity }
                          style={{color: "red"}}
                        >
                          End
                        </span>
                        <span
                          className="action-button"
                          selector={ i }
                          onClick={ pauseResumeActivity }
                        >
                          Pause
                        </span>
                      </td>
                    )
                  case "paused":
                    return (
                      <td>
                        <span
                          className="action-button"
                          selector={ i }
                          onClick={ pauseResumeActivity }
                        >
                          Resume
                        </span>
                      </td>
                    )
                }
                }())}
            </tr>))
          }
        </table>
      </div>
    </div>
    }
    </>
  );
}
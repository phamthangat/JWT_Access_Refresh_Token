import { Form, Input, Button, Checkbox } from 'antd';
import styled from 'styled-components';
import "antd/dist/antd.css";
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
const Login = () => {
  const [user, setUser] = useState({});
  const [err, setErr] = useState("");

  const refresh = refreshToken => {
    console.log("Refreshing token!");

    return new Promise((resolve, reject) => {
      axios
        .post("http://localhost:5000/refresh", { token: refreshToken })
        .then(data => {
          if (data.data.success === false) {
            setErr("Login again");
            // set message and return.
            resolve(false);
          } else {
            const { accessToken } = data.data;
            Cookies.set("access", accessToken);
            resolve(accessToken);
          }
        });
    });
  };

  const requestLogin = async (accessToken, refreshToken) => {
    console.log(accessToken, refreshToken);
    return new Promise((resolve, reject) => {
      axios
        .post(
          "http://localhost:5000/protected",
          {},
          { headers: { authorization: `Bearer ${accessToken}` } }
        )
        .then(async data => {
          if (data.data.success === false) {
            if (data.data.message === "User not authenticated") {
              setErr("Login again");
              // set err message to login again.
            } else if (
              data.data.message === "Access token expired"
            ) {
              const accessToken = await refresh(refreshToken);
              return await requestLogin(
                accessToken,
                refreshToken
              );
            }

            resolve(false);
          } else {
            // protected route has been accessed, response can be used.
            setErr("Protected route accessed!");
            resolve(true);
          }
        });
    });
  };

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
    console.log(user);
  };

  const handleSubmit = e => {
    e.preventDefault();

    axios.post("http://localhost:5000/login", { user }).then(data => {
      const { accessToken, refreshToken } = data.data;

      Cookies.set("access", accessToken);
      Cookies.set("refresh", refreshToken);
    });
  };

  const hasAccess = async (accessToken, refreshToken) => {
    if (!refreshToken) return null;

    if (accessToken === undefined) {
      // generate new accessToken
      accessToken = await refresh(refreshToken);
      return accessToken;
    }

    return accessToken;
  };

  const protect = async e => {
    let accessToken = Cookies.get("access");
    let refreshToken = Cookies.get("refresh");

    accessToken = await hasAccess(accessToken, refreshToken);

    if (!accessToken) {
      // Set message saying login again.
    } else {
      await requestLogin(accessToken, refreshToken);
    }
  };

  const Container = styled.div`
    display: flex;
    justify-content: center;
    height: 100vh;
    align-items: center;
  `;
  return (
    <div className="App">
      <form action="" onChange={handleChange} onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email address" />
        <br />
        <br />

        <input name="password" type="password" placeholder="Password" />
        <br />
        <br />
        <input type="submit" value="Login" />
        <br />
        <br />
      </form>
      {err}
      <button onClick={protect}>Access Protected Content</button>
    </div>
    // <Container style={{ display: 'flex', justifyContent: 'center', }}>
    //   <Form style={{ width: "500px" }} onChange={handleChange} onSubmit={handleSubmit}
    //     name="basic"
    //     labelCol={{
    //       span: 8,
    //     }}
    //     wrapperCol={{
    //       span: 16,
    //     }}
    //     initialValues={{
    //       remember: true,
    //     }}
    //     onFinish={onFinish}
    //     onFinishFailed={onFinishFailed}
    //     autoComplete="off"
    //   >
    //     <Form.Item
    //       label="Username"
    //       name="username"
    //       rules={[
    //         {
    //           required: true,
    //           message: 'Please input your username!',
    //         },
    //       ]}
    //     >
    //       <Input />
    //     </Form.Item>

    //     <Form.Item
    //       label="Password"
    //       name="password"
    //       rules={[
    //         {
    //           required: true,
    //           message: 'Please input your password!',
    //         },
    //       ]}
    //     >
    //       <Input.Password />
    //     </Form.Item>

    //     <Form.Item
    //       name="remember"
    //       valuePropName="checked"
    //       wrapperCol={{
    //         offset: 8,
    //         span: 16,
    //       }}
    //     >
    //       <Checkbox>Remember me</Checkbox>
    //     </Form.Item>

    //     <Form.Item
    //       wrapperCol={{
    //         offset: 8,
    //         span: 16,
    //       }}
    //     >
    //       <Button type="primary" htmlType="submit">
    //         Submit
    //       </Button>
    //     </Form.Item>
    //   </Form>
    // </Container>
  );
};

export default Login;
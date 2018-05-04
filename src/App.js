import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/Navigation';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import './App.css';
import particlesOptions from './particlesjs-config';

const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signIn',
  isSignedIn: false,
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    }
    )
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width= Number(image.width);
    const height= Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({ imageURL: this.state.input });
    fetch('https://smartbrain-sbiehl.herokuapp.com/imageurl/', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(resp => resp.json())
    .then(response => {
      if(response) {
        fetch('https://smartbrain-sbiehl.herokuapp.com/image/', {
          method: 'put',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: this.state.user.id
          })})
          .then(resp => resp.json())
          .then(count => {
            this.setState(Object.assign(this.state.user,  {entries: count}))
          })
          .catch(console.log);
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signOut') {
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, route, box, imageURL } = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange} />
        { route === 'home' 
          ? 
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit={this.onPictureSubmit}/>
              <FaceRecognition box={box} imageURL={imageURL}/>
            </div>
          : (
            (route === 'signIn' || route === 'signOut') ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> :  <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )}
      </div>
      );
    }
  }
  
  export default App;

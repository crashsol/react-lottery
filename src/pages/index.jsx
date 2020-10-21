import React, { Component } from 'react';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TWEEN from 'tween';
import TrackballControls from 'three-trackballcontrols';
import { CSS3DRenderer, CSS3DObject } from 'three-css3drenderer';

export default class Scene extends Component {
  componentWillMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidMount() {
    this.THREE = THREE;
    this.renderer = null;
    this.setupScene();
  }

  setupScene = () => {
    this.THREE = THREE;
    let objects = [];
    let targets = { table: [], sphere: [], helix: [], grid: [] };
    let table = [
      'H',
      'Hydrogen',
      '1.00794',
      1,
      1,
      //Deleted most of the stuff to save space
      'Uuo',
      'Ununoctium',
      '(294)',
      18,
      7,
    ];

    let scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.z = 3000;
    scene.add(camera);

    this.scene = scene;
    this.camera = camera;
    this.objects = objects;
    this.targets = targets;

    for (var i = 0; i < 100; i++) {
      var element = document.createElement('div');
      element.className = 'element';
      element.style.backgroundColor =
        'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

      var number = document.createElement('div');
      number.className = 'number';
      number.textContent = i / 5 + 1;
      element.appendChild(number);

      var symbol = document.createElement('div');
      symbol.className = 'symbol';
      symbol.textContent = table[i];
      element.appendChild(symbol);

      var details = document.createElement('div');
      details.className = 'details';
      details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
      element.appendChild(details);
      var object = new CSS3DObject(element);

      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);

      objects.push(object);

      var object = new THREE.Object3D();
      object.position.x = table[i + 3] * 140 - 1260;
      object.position.y = -(table[i + 4] * 180) + 990;
      targets.table.push(object);
    }
    for (var i = 0; i < objects.length; i++) {
      var object = new THREE.Object3D();

      object.position.x = (i % 5) * 400 - 800;
      object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800;
      object.position.z = Math.floor(i / 25) * 1000 - 2000;

      targets.grid.push(object);
    }

    //渲染
    this.renderer = new CSS3DRenderer();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(this.renderer.domElement);

    // 鼠标控制

    this.controls = new TrackballControls(camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 500;
    this.controls.maxDistance = 6000;
    this.controls.addEventListener('change', this.renderScene);

    this.transform(targets.table, 2000);
    this.start();
  };
  transform = (targets, duration) => {
    TWEEN.removeAll();

    for (var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      var target = targets[i];
      new TWEEN.Tween(object.position)
        .to(
          { x: target.position.x, y: target.position.y, z: target.position.z },
          Math.random() * duration + duration,
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to(
          { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          Math.random() * duration + duration,
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }

    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(this.renderScene)
      .start();
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.renderScene();
    TWEEN.update();
    this.controls.update();
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  handleWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderScene();
  };

  componentWillUnmount = () => {
    this.stop();
    this.destroyContext();
  };

  destroyContext = () => {
    this.container.removeChild(this.renderer.domElement);
    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;
    this.renderer = null;
  };

  render() {
    const width = '100%';
    const height = '100%';
    return (
      <div
        ref={container => {
          this.container = container;
        }}
        id="container"
        style={{
          width: width,
          height: height,
          position: 'absolute',
          overflow: 'hidden',
        }}
      ></div>
    );
  }
}

import React, { Component, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TWEEN from 'tween';
import TrackballControls from 'three-trackballcontrols';
import { CSS3DRenderer, CSS3DObject } from 'three-css3drenderer';
import useSetInterval from './hooks/useSetInterval';
import head from '../images/1.png';

let scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.Renderer,
  controls: TrackballControls;

const personArray = new Array();
for (let index = 0; index < 200; index++) {
  const element = 200;
  personArray.push({
    image: head,
  });
}

const lottery = () => {
  const [allObjects, setAllObjects] = useState<Array<any>>([]);
  const [initType, setInitType] = useState(0);
  const savedCallback = useRef();

  const [targets, setTargets] = useState<{
    table: Array<any>;
    sphere: Array<any>;
    helix: Array<any>;
    grid: Array<any>;
  }>({
    table: [],
    sphere: [],
    helix: [],
    grid: [],
  });

  useEffect(() => {
    init();
    animate();
    return () => {
      window.removeEventListener('resize', onWindowResize);
      controls.removeEventListener('change', render);
    };
  }, []);

  useSetInterval(() => {
    let type = initType >= 3 ? 0 : initType;
    ++type;
    switch (type) {
      case 1:
        transform(targets.sphere, 1000);
        break;
      case 2:
        transform(targets.helix, 1000);
        break;
      case 3:
        transform(targets.grid, 1000);
        break;
    }
    setInitType(type);
  }, 8000);

  const init = () => {
    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.z = 3000; //创建相机
    scene = new THREE.Scene(); //创建场景
    createNodes(); //添加图形

    //渲染
    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container')!.appendChild(renderer.domElement);

    // 鼠标控制
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    //启动画面
    transform(targets.table, 2000);
    window.addEventListener('resize', onWindowResize, false);
  };

  //创建数据节点
  const createNodes = () => {
    for (var i = 0; i < personArray.length; i++) {
      var element = document.createElement('div');
      element.className = 'element';
      element.style.backgroundColor =
        'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

      var img = document.createElement('img');
      img.src = personArray[i].image;
      element.appendChild(img);

      var object = new CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);
      allObjects.push(object);
    }

    // Tables
    for (var i = 0; i < personArray.length; i++) {
      const p_x = (i % 20) + 1;
      const p_y = Math.floor(i / 20) + 1;

      var object = new THREE.Object3D();
      // object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
      // object.position.y = - ( table[ i + 4 ] * 180 ) + 990;
      object.position.x = p_x * 140 - 1330;
      object.position.y = -(p_y * 180) + 990;
      targets.table.push(object);
    }

    // sphere

    var vector = new THREE.Vector3();
    var spherical = new THREE.Spherical();
    for (var i = 0, l = allObjects.length; i < l; i++) {
      var phi = Math.acos(-1 + (2 * i) / l);
      var theta = Math.sqrt(l * Math.PI) * phi;
      var object = new THREE.Object3D();
      spherical.set(800, phi, theta);
      object.position.setFromSpherical(spherical);
      vector.copy(object.position).multiplyScalar(2);
      object.lookAt(vector);
      targets.sphere.push(object);
    }

    // helix
    var vector = new THREE.Vector3();
    var cylindrical = new THREE.Cylindrical();
    for (var i = 0, l = allObjects.length; i < l; i++) {
      var theta = i * 0.175 + Math.PI;
      var y = -(i * 5) + 450;
      var object = new THREE.Object3D();
      // 参数一 圈的大小 参数二 左右间距 参数三 上下间距
      cylindrical.set(900, theta, y);
      object.position.setFromCylindrical(cylindrical);
      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;
      object.lookAt(vector);
      targets.helix.push(object);
    }

    // grid

    for (var i = 0; i < allObjects.length; i++) {
      var object = new THREE.Object3D();
      object.position.x = (i % 5) * 400 - 800; // 400 图片的左右间距  800 x轴中心店
      object.position.y = -(Math.floor(i / 5) % 5) * 300 + 500; // 500 y轴中心店
      object.position.z = Math.floor(i / 25) * 200 - 800; // 300调整 片间距 800z轴中心店
      targets.grid.push(object);
    }
  };

  //转换场景的动画效果
  const transform = (targets: any[], duration: number) => {
    TWEEN.removeAll();
    for (var i = 0; i < allObjects.length; i++) {
      var object = allObjects[i];
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
      .onUpdate(render)
      .start();
  };

  //窗口变动
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  };

  //animate
  const animate = () => {
    // 让场景通过x轴或者y轴旋转  & z
    // scene.rotation.x += 0.011;
    scene.rotation.y += 0.01; //控制转动

    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    // 渲染循环
    render();
  };

  //执行渲染
  const render = () => {
    (renderer as any).render(scene, camera);
  };
  return (
    <div>
      <div id="container"></div>
    </div>
  );
};

export default lottery;

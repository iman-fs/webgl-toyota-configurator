import * as THREE from 'three';

			import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
			import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
			import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
			import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';

			var container, controls;
			var camera, scene, renderer;

			init();
			render();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				// camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
        // camera.position.set( - 1.8, 0.6, 2.7 );
        
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(400, 200, 0);

				scene = new THREE.Scene();

				new RGBELoader()
					.setDataType( THREE.UnsignedByteType )
					.setPath( 'dist/env/' )
					.load( 'test.hdr', function ( texture ) {

						var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

						scene.background = envMap;
						scene.environment = envMap;

						texture.dispose();
						pmremGenerator.dispose();

						render();

						// model

						// use of RoughnessMipmapper is optional
						var roughnessMipmapper = new RoughnessMipmapper( renderer );

						var loader = new GLTFLoader().setPath( 'dist/' );
						loader.load( 'c_new.glb', function ( gltf ) {
              
							gltf.scene.traverse( function ( child ) {

								if ( child.isMesh ) {
                  console.log(child)
									// TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
									// roughnessMipmapper.generateMipmaps( child.material );

								}

							} );

							scene.add( gltf.scene );

							roughnessMipmapper.dispose();

							render();

						} );

					} );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 1;
				renderer.outputEncoding = THREE.sRGBEncoding;
				container.appendChild( renderer.domElement );

				var pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();

				controls = new OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', render ); // use if there is no animation loop
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 100;
        controls.maxDistance = 1000;
        controls.maxPolarAngle = Math.PI ;
				// controls.minDistance = 2;
				// controls.maxDistance = 10;
				// controls.target.set( 0, 0, - 0.2 );
        controls.update();
        
        

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			//

			function render() {

				renderer.render( scene, camera );

			}
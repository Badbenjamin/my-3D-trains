import { useGLTF } from '@react-three/drei'

import * as THREE from "three"

function Map(){
    const land = useGLTF('./public/subway_map_LAND_ONLY_8.25.glb')
    const water = useGLTF('./public/subway_map_WATER_ONLY_8.25.glb')

  
    water.nodes['WATER_2'].geometry.computeBoundingBox();
    
    let gradientMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color1: {
            value: new THREE.Color('darkblue')
          },
          color2: {
            value: new THREE.Color("black")
          },
          bboxMin: {
            
            value: water.nodes['WATER_2'].geometry.boundingBox.min
          },
          bboxMax: {
            value: water.nodes['WATER_2'].geometry.boundingBox.max
          },
        //   center: { value: new THREE.Vector2(0.5, 0.5) },
          
        //   gradientDirection: { value: new THREE.Vector3(0, 1, 0) },
        //   gradientPower: { value: 0.1 }
            // center: { value: new THREE.Vector2(0.5, 0.5) }, // Radial center point
            // radius: { value: 1.0 } // Maximum radius
        },
        
        vertexShader: `
          uniform vec3 bboxMin;
          uniform vec3 bboxMax;
  
          varying vec3 vWorldPosition;
          varying vec2 vUv;

        void main() {
        // Pass world position for center calculation
        vWorldPosition = position;
        
        // Also create UV coordinates (0-1 range)
        vUv.x = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
        vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        
        }
    `,
        
        
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 bboxMin;
            uniform vec3 bboxMax;
        
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            // uniform vec2 gradientCenter;
            
            void main() {
    
            vec3 geometryCenter = (bboxMin + bboxMax) * 0.5;
            vec3 bboxSize = bboxMax - bboxMin;
            // float circleRadius = min(bboxSize.x, bboxSize.y) * 0.5;
            
            
            float dist = distance(vWorldPosition.xz, geometryCenter.xz);
            
           
            float maxRadius = length(bboxSize.xy) * 0.7;
            float gradient = clamp(dist / maxRadius, 0.0, 1.0);
            // vec3 finalColor = vec4(mix(color1, color2, gradient));
            vec3 finalColor = mix(color1, color2, gradient);
            float alpha = 1.0 + gradient;

            
            
            // gl_FragColor = vec4(mix(color1, color2, gradient), 0.8);
            gl_FragColor = vec4(finalColor, alpha);

        }
        `,
        wireframe: false
      });

      

    const newName = water.name
        const newGeometry = water.nodes['WATER_2'].geometry
        let newMaterial =  water.nodes['WATER_2'].material;
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = water.nodes['WATER_2'].position
        const newRotation = water.nodes['WATER_2'].rotation
        const newScale = water.nodes['WATER_2'].scale

    return(
        <>
            <primitive 
            castShadow={true}
            receiveShadow={true}
            object={land.scene}
            />
            <mesh
            //  ref={stationRef[index]}
             name={newName}
             castShadow={true}
             receiveShadow={true}
             geometry={newGeometry}
             material={gradientMaterial}
             position={newPosition}
             rotation={newRotation}
             scale={newScale}
            />
        </>     
    )
}

export default Map
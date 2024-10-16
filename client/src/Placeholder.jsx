
function PlaceHolder(props){
    return(
        <mesh {...props}>
            <planeGeometry args={[1,1,1]}/>
            <meshBasicMaterial wireframe color='red' />
        </mesh>
    )
}

export default PlaceHolder
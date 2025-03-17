import {pool} from "./postgres/conexion.js";

const login=async(user,password)=>{
    let datosPersonales = [];
    try{
        const consulta = await pool.query("SELECT * FROM estudiante where numero_control=$1 AND contrasena_estudiante=$2",
            [user,password]
        );
        
        if(consulta.rows.length>0){
            console.log("Login exitoso");
            return consulta.rows[0];
        }else{
            console.log("Usuario o contraseña incorrectos.");
            return null;
        }
    }catch(e){
        console.log(consulta)
    }finally{
        await pool.end();
    }
}

login("22320813","1234").then((usuario)=>{
    if(usuario){
        console.log("Datos del usuario: ", usuario);
    }else{
        console.log("No se pudo realizar el login");
    }
});
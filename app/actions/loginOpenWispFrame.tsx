"use server"


export async function loginOpenWispFrame(auth_user: string, auth_pass: string) {
    try {
        const formData = JSON.stringify({
            auth_user: auth_user,
            auth_pass: auth_pass,
            zone: "zone1",
            redirurl: "http://localhost:8080/default/status",
            accept: "accept"
        });

        const response = await fetch(`http://localhost:8002/index.php`, {
            method: "POST",
            headers: {
                //"accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

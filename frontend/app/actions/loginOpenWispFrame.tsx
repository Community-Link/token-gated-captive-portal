"use server"


export async function loginOpenWispFrame(auth_user: string, auth_pass: string) {
    try {

        const formData = new URLSearchParams();
        formData.append('auth_user', auth_user);
        formData.append('auth_pass', auth_pass);
        formData.append('zone', "zone1");
        formData.append('redirurl', "http://10.0.0.3:8080/default/status");
	    formData.append('accept',"accept");

        await fetch("http://10.0.0.1:8002/index.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });
    } catch (error) {
        console.log(error);
    }
}

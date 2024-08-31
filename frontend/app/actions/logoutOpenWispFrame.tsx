"use server"


export async function logoutOpenWispFrame(logout_id: string) {
    try {

        const formData = new URLSearchParams();
        formData.append('id', logout_id);
        formData.append('zone', "zone1");
	    formData.append('logout',"Disconnect");

        await fetch("http://10.0.0.1:8002/", {
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

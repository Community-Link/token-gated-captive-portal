"use server"

import fetch from 'node-fetch';
import https from "https";
import { headers } from 'next/headers';

export async function loginRadius (username: string, password: string) {
    try {
        const headersList = headers(); // Get the headers from the incoming request
        const csrfToken = headersList.get("X-CSRFToken")
        const agent = new https.Agent({
            rejectUnauthorized: false, // Allow self-signed certificates
        });
        const response = await fetch("https://openwisp.sin.io/api/v1/radius/organization/default/account/token/", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken!,
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
            agent: agent,
        });
        const data =  await response.json()
        console.log(data)
    } catch (error) {
        console.log(error)   
    }
}
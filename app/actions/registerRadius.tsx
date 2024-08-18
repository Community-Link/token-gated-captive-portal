"use server"

import fetch from 'node-fetch';
import https from "https";
import { headers } from 'next/headers';

export async function registerRadius (
    username: string,
    email: string,
) {
    try {
        const headersList = headers(); // Get the headers from the incoming request
        const csrfToken = headersList.get("X-CSRFToken")
        const agent = new https.Agent({
            rejectUnauthorized: false, // Allow self-signed certificates
        });
        const response = await fetch("https://openwisp.sin.io/api/v1/radius/organization/default/account/", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken!,
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password1: "0x001234",
                password2: "0x001234",
                phone_number: "",
                birth_date: "2024-08-17",
                method: ""
            }),
            agent: agent,
        });
        const data =  await response.json()
        console.log(data)
    } catch (error) {
        console.log(error)   
    }
}
"use server"

import fetch from 'node-fetch';
import https from "https";
import { headers } from 'next/headers';

export async function postAurhFreeRadius ( 
    password: string, 
    called_station_id: string, 
    calling_station_id: string, 
    username: string, 
    reply: string
) {
    try {
        const headersList = headers(); // Get the headers from the incoming request
        const csrfToken = headersList.get("X-CSRFToken")
        const agent = new https.Agent({
            rejectUnauthorized: false, // Allow self-signed certificates
        });
        const response = await fetch("https://openwisp.sin.io/api/v1/freeradius/postauth/", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken!,
            },
            body: JSON.stringify({
                password: password,
                called_station_id: called_station_id,
                calling_station_id: calling_station_id,
                username: username,
                reply: reply
                
            }),
            agent: agent,
        });
        const data =  await response.json()
        console.log('authy', data)
    } catch (error) {
        console.log('authy', error)     
    }
}
"use server"

import fetch from 'node-fetch';
import https from "https";
import { headers } from 'next/headers';

export async function postAccountingFreeRadius (username: string) {
    try {
        const headersList = headers(); // Get the headers from the incoming request
        const csrfToken = headersList.get("X-CSRFToken")
        const agent = new https.Agent({
            rejectUnauthorized: false, // Allow self-signed certificates
        });
        const response = await fetch(`${process.env.BASE_URL}/api/v1/freeradius/accounting/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${process.env.UUID} ${process.env.TOKEN}`,
            },
            body: JSON.stringify({
                unique_id: "string",
                framed_ip_address: "0.1.2.3",
                framed_ipv6_address: "2001:0db8:5b96:0000:0000:426f:8e17:642a",
                session_time: 0,
                stop_time: "2024-08-18T16:23:59.892Z",
                update_time: "2024-08-18T16:23:59.893Z",
                input_octets: 0,
                output_octets: 0,
                status_type: "Start",
                session_id: "string",
                username: username,
                groupname: "string",
                realm: "string",
                nas_ip_address: "1.2.3.4",
                nas_port_id: "string",
                nas_port_type: "string",
                start_time: "2024-08-18T16:23:59.893Z",
                interval: 0,
                authentication: "string",
                connection_info_start: "string",
                connection_info_stop: "string",
                called_station_id: "string",
                calling_station_id: "string",
                terminate_cause: "string",
                service_type: "string",
                framed_protocol: "string",
                framed_ipv6_prefix: "2001:db8::/32",
                framed_interface_id: "string",
                delegated_ipv6_prefix: "2001:db8::/32"
            }),
            agent: agent,
        });
        const data =  await response.json()
        console.log('accounting', data)
    } catch (error) {
        console.log('accounting', error)   
    }
}
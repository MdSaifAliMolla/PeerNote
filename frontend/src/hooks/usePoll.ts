"use client";

import { useEffect } from "react"
import { getAuthHeaders } from "../utils/getAuthHeaders"
import { getCentralServerBaseUrl, getPeerServiceBaseUrl } from "../utils/env"
import { getSessionCookie } from "../contexts/session"
export const usePoll = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      pollServer()
        .catch((error) => {
          console.error('Error:', error);
        });
    }, 30 * 60000) // poll every 30 minutes  
    return () => {
      // clean up
      clearInterval(interval);
    };
  }, [])

  const pollServer = async () => {
    if (!getSessionCookie()) {
      return;
    }
    // request private ip from peer service
    return fetch(`${getPeerServiceBaseUrl()}/ip`)
      .then(response => response.text())
      .then((data) => {
        // send private ip to central server
        return fetch(`${getCentralServerBaseUrl()}/api/poll/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ip: data }),
        })
      }).then(response => response.json())
      .then(data => {
        console.log("Poll response data:", data);
      })
  }
}
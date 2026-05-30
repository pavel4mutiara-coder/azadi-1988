/**
 * Google Chat Integration Utility
 * Handles REST requests to Chat APIs using the OAuth access token
 */

export interface GoogleChatSpace {
  name: string; // e.g., "spaces/AAAAAAAAAAA"
  displayName?: string;
  type?: string; // "ROOM" or "DM"
}

export interface ListSpacesResponse {
  spaces: GoogleChatSpace[];
  nextPageToken?: string;
}

/**
 * Fetch list of Google Chat spaces that the user/app has access to
 */
export async function listGoogleChatSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  try {
    const response = await fetch('https://chat.googleapis.com/v1/spaces', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP Error ${response.status}`);
    }

    const data: ListSpacesResponse = await response.json();
    return data.spaces || [];
  } catch (error) {
    console.error('Error listing Google Chat spaces:', error);
    throw error;
  }
}

/**
 * Send a message to a specific Google Chat space
 */
export async function sendGoogleChatMessage(
  accessToken: string,
  spaceName: string,
  text: string,
  cardsV2?: any[]
): Promise<any> {
  try {
    const payload: any = { text };
    if (cardsV2) {
      payload.cardsV2 = cardsV2;
    }

    const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting message to Google Chat:', error);
    throw error;
  }
}

/**
 * Generate a visual card layout for Google Chat notification
 * Following Google's cardsV2 format
 */
export function createChatCard(title: string, subtitle: string, sections: { header?: string; widgets: any[] }[]) {
  return [
    {
      cardId: `notification_${Date.now()}`,
      card: {
        header: {
          title,
          subtitle,
          imageUrl: 'https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh', // Azadi logo
          imageType: 'CIRCLE'
        },
        sections
      }
    }
  ];
}

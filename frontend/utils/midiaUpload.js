import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let url = "https://qkoichhnzowghdcmkuu1.supabase.co";
let key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrb2ljaGhuem93Z2hkY21rdXUxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTI3ODcsImV4cCI6MjA1MTU4ODc4N30.GhueG93aHFkY21rbXVi1wiCm95";
const supabase = createClient(url, key);

export default function uploadMedia(file) {
    return new Promise((resolve, reject) => {
        if (file == null) {
            reject("No file selected");
        } else {
            const timeStamp = new Date().getTime();
            const fileName = timeStamp + "_" + file.name;

            supabase.storage
                .from('media')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })
                .then(({ data, error }) => {
                    if (error) {
                        reject(error.message || error);
                    } else {
                        // Retrieve the public URL for the uploaded file
                        const { data: publicUrlData } = supabase.storage
                            .from('media')
                            .getPublicUrl(fileName);

                        if (publicUrlData && publicUrlData.publicUrl) {
                            resolve(publicUrlData.publicUrl);
                        } else {
                            reject("Failed to retrieve public URL");
                        }
                    }
                })
                .catch(err => {
                    reject(err.message || err);
                });
        }
    });
}


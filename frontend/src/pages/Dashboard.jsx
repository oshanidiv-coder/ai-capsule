import { useEffect, useRef, useState } from "react";
import "../App.css";

function Dashboard() {
    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [screenshotFile, setScreenshotFile] = useState(null);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        project_name: "",
        prompt_title: "",
        prompt_version: "",
        prompt_text: "",
        response_summary: "",
        category: "",
        usefulness: "",
        reviewed: false,
        improved: false,
        screenshot_url: "",
        notes: ""
    });

    const loadCapsules = async () => {
        try {
            const response = await fetch(
                "/api/capsules",
                {
                    credentials: "include"
                }
            );

            if (response.status === 401) {
        

            window.location.href = "/login";

            return;


            }

            if (!response.ok) {
                throw new Error("Unable to load prompts.");
            }

            const data = await response.json();


            setCapsules(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCapsules();
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm({
            ...form,
            [name]:type === "checkbox" ? checked :value
        });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
    const formData = new FormData();

    Object.keys(form).forEach((key) => {

    let value = form[key];

    if (key === "reviewed" || key === "improved") {

    value = value ? 1 : 0;

    }

    formData.append(key, value);

    });

    if (screenshotFile) {

   formData.append("screenshot", screenshotFile);

   }

        try {
            const response = await fetch(
                editingId ? "/api/capsules/" + 
                editingId : "/api/capsules/",
                {
                    method: editingId ? "PUT" : "POST",

                    credentials: "include",

                    body: formData                    
                }
            );

            if (!response.ok) {

 const errorData = await response.json();

 if (response.status === 401) {

 window.location.href = "/login";

 return;

}

 throw new Error(errorData.error || "Unable to save prompt.");

}

            setForm({
                project_name: "",
                prompt_title: "",
                prompt_version: "",
                prompt_text: "",
                response_summary: "",
                category: "",
                usefulness: "",
                reviewed: false,
                improved: false,
                screenshot_url: "",
                notes: ""
            });
            setEditingId(null);

            setScreenshotFile(null);
            if (fileInputRef.current) {

 fileInputRef.current.value = "";

}

            await loadCapsules();

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <p>Loading prompts...</p>;
    }

    const handleEdit = (capsule) => {

        setError("");

    setEditingId(capsule.id);

 setForm({

 project_name: capsule.project_name || "",

 prompt_title: capsule.prompt_title || "",

 prompt_version: capsule.prompt_version || "",

 prompt_text: capsule.prompt_text || "",

 response_summary: capsule.response_summary || "",

 category: capsule.category || "",

 usefulness: capsule.usefulness || "",

 reviewed: Boolean(capsule.reviewed),

 improved: Boolean(capsule.improved),

 screenshot_url: capsule.screenshot_url || "",

 notes: capsule.notes || ""

 });

};

const handleCancelEdit = () => {
    setError("");

 setEditingId(null);

 if (fileInputRef.current) {

 fileInputRef.current.value = "";

}

 setForm({

 project_name: "",

 prompt_title: "",

 prompt_version: "",

 prompt_text: "",

 response_summary: "",

 category: "",

 usefulness: "",

 reviewed: false,

 improved: false,

 screenshot_url: "",

 notes: ""

 });

};

const handleLogout = async () => {

 try {

 await fetch("/api/capsules", {

 method: "POST",

 credentials: "include"

 });

 window.location.href = "/login";

 } catch (err) {

 setError("Unable to log out.");

 }

};

    const handleDelete = async (id) => {
const confirmed = window.confirm("Are you sure you want to delete this prompt?");
if (!confirmed) return; 
try {

 const response = await fetch("/api/capsules/"+id, {
    method: "DELETE",
    credentials: "include"

 });

 if (!response.ok) {

 const errorData = await response.json();

 if (response.status === 401) {

 window.location.href = "/login";

 return;

}

 throw new Error(errorData.error || errorData.message || "Failed to delete capsule");

}
 setCapsules((prevCapsules) =>

 prevCapsules.filter((capsule) => capsule.id !== id)

 );

 } catch (err) {

 setError(err.message);

 }

};

    return (
        <div className="dashboard">
<div className="dashboard-header">
            <h1>AI Capsule Dashboard</h1><button type="button" className="logout-button" onClick={handleLogout}>

 Logout

</button>

</div>

<form className="prompt-form" onSubmit={handleSubmit}>

    <div className="form-row">
        <label>Project Name</label>

        <input
            type="text"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            required
        />
    </div>

    <div className="form-row">
        <label>Prompt Title</label>

        <input
            type="text"
            name="prompt_title"
            value={form.prompt_title}
            onChange={handleChange}
            required
        />
    </div>

    <div className="form-row">
        <label>Prompt Version</label>

        <input
            type="text"
            name="prompt_version"
            value={form.prompt_version}
            onChange={handleChange}
            placeholder="e.g. v1"
        />
    </div>

    <div className="form-row">
        <label>Prompt</label>

        <textarea
            name="prompt_text"
            value={form.prompt_text}
            onChange={handleChange}
            rows="5"
            required
        />
    </div>

    <div className="form-row">
        <label>Response Summary</label>

        <textarea
            name="response_summary"
            value={form.response_summary}
            onChange={handleChange}
            rows="3"
        />
    </div>

   <div className="form-row">

 <label>Category</label>

 <select

 name="category"

 value={form.category}

 onChange={handleChange}

 >

 <option value="">Select category</option>

 <option value="Coding">Coding</option>

 <option value="Writing">Writing</option>

 <option value="Study">Study</option>

 <option value="Research">Research</option>

 <option value="Debugging">Debugging</option>

 <option value="Other">Other</option>

 </select>

</div>

    <div className="form-row">
        <label>Usefulness</label>

        <select
            name="usefulness"
            value={form.usefulness}
            onChange={handleChange}
        >
            <option value="">Select usefulness</option>
            <option value="Good">Good</option>
            <option value="Needs improvement">Needs improvement</option>
        </select>
    </div>

    <div className="form-row">
        <label>Reviewed</label>

        <div className="checkbox-field">
            <input
                type="checkbox"
                name="reviewed"
                checked={form.reviewed}
                onChange={handleChange}
            />
        </div>
    </div>

    <div className="form-row">
        <label>Improved</label>

        <div className="checkbox-field">
            <input
                type="checkbox"
                name="improved"
                checked={form.improved}
                onChange={handleChange}
            />
        </div>
    </div>

    <div className="form-row">
        <label>Screenshot URL</label>

        <input
            type="text"
            name="screenshot_url"
            value={form.screenshot_url}
            onChange={handleChange}
            placeholder="Optional"
        />
    </div>

    <div className="form-row">

    <label>Upload Screenshot</label>

    <input

    type="file"

    accept="image/*"

    onChange={(event) => setScreenshotFile(event.target.files[0])}
    ref={fileInputRef}

    />

    </div>

    <div className="form-row">
        <label>Notes</label>

        <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
        />
    </div>

    <div className="form-actions">

    <button className="save-button" type="submit">
        {editingId ? "Update Prompt" : "Create Prompt"}
    </button>

{editingId && (

 <button type="button" className="cancel-button" onClick={handleCancelEdit}>

 Cancel

 </button>

)}

</div>
</form>

            <hr />

            <h2>My Prompts</h2>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!error && capsules.length === 0 && (
                <p>You do not have any saved prompts yet.</p>
            )}

            {capsules.map((capsule) => (
                <div key={capsule.id} className="prompt-card">

                    <h3>{capsule.prompt_title}</h3>

                    <p className="capsule-id"><strong>ID:</strong> {capsule.id}</p>

                    <div className="prompt-details">
                    <p>
                        <strong>Project:</strong>{" "}
                        {capsule.project_name}
                    </p>

                    <p>
                        <strong>Version:</strong>{" "}
                        {capsule.prompt_version}
                    </p>

                    <p>
                        <strong>Prompt:</strong>{" "}
                        {capsule.prompt_text}
                    </p>

                    <p>

                    <strong>Response Summary:</strong>{" "}

                    {capsule.response_summary}

                    </p>

                    <p>
                        <strong>Category:</strong>{" "}
                        {capsule.category}
                    </p>

                    <p>
                        <strong>Usefulness:</strong>{" "}
                        {capsule.usefulness}
                    </p>

                    <p>

                    <strong>Reviewed:</strong>{" "}

                    {capsule.reviewed ? "Yes" : "No"}

                    </p>

                    <p>

                    <strong>Improved:</strong>{" "}

                    {capsule.improved ? "Yes" : "No"}

                    </p>

                    {capsule.screenshot_url && (
                        <div className="screenshot-section">

                    <p>

                    <strong>Screenshot:</strong>{" "}

                    <a href={capsule.screenshot_url} target="_blank" rel="noopener noreferrer">


                    View Screenshot

                    </a>

                    </p>

                    <a href={capsule.screenshot_url} target="_blank" rel="noopener noreferrer">​‌


                    <img src={capsule.screenshot_url} alt="Screenshot preview"
                    className="screenshot-preview"/>

                    </a>
                
                    </div>

                    )}

                    <p>
                        <strong>Notes:</strong>{" "}
                        {capsule.notes}
                    </p>
                    </div>
                    <div className="card-actions">
                    <button className="edit-button" type="button" onClick={() => handleEdit(capsule)}>

                    Edit

                    </button>

                    <button className="delete-button" type="button" onClick={() => handleDelete(capsule.id)}>

                    Delete

                    </button>
                    </div>


                </div>
            ))}

        </div>
    );
}

export default Dashboard;
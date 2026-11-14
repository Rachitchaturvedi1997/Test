import { useState } from 'react'
import { Link } from 'react-router-dom'
import { claims, patients } from '../data'
import DateInput, { normalizeDate } from '../components/DateInput'

export default function PatientSearch() {
  const [id, setId] = useState('')
  const [dob, setDob] = useState('')
  const [last, setLast] = useState('')
  const [ran, setRan] = useState(false)
  const d = normalizeDate(dob)
  const res = ran
    ? patients.filter(
        (p) =>
          (!id.trim() || p.id.toLowerCase() === id.trim().toLowerCase()) &&
          (!d || p.dob === d) &&
          (!last.trim() || p.lastName.toLowerCase().startsWith(last.trim().toLowerCase())),
      )
    : []
  return (
    <div className="page">
      <h1 className="page-title">Patient search</h1>
      <form
        className="form-row"
        onSubmit={(e) => {
          e.preventDefault()
          setRan(true)
        }}
      >
        <div className="fld">
          <label htmlFor="ps-id">Patient ID</label>
          <input id="ps-id" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="fld">
          <label htmlFor="ps-dob">Date of birth</label>
          <DateInput id="ps-dob" value={dob} onChange={setDob} />
        </div>
        <div className="fld">
          <label htmlFor="ps-last">Last name</label>
          <input id="ps-last" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
        <button className="btn-primary" type="submit" style={{ height: 40 }}>
          Search
        </button>
      </form>
      {ran && (
        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table className="grid">
            <thead>
              <tr>
                <th>Patient name</th>
                <th>Patient ID</th>
                <th>Date of birth</th>
                <th>Plan</th>
                <th>Group</th>
                <th>Coverage</th>
                <th>Claims</th>
              </tr>
            </thead>
            <tbody>
              {res.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    No patients found.
                  </td>
                </tr>
              )}
              {res.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="num">{p.id}</td>
                  <td className="num">{p.dob}</td>
                  <td>{p.plan}</td>
                  <td className="num">{p.group}</td>
                  <td>
                    <span className="badge">Active</span>
                  </td>
                  <td>
                    <Link to={`/app/claim/search?tab=patient&mode=dobid&dob=${encodeURIComponent(p.dob)}&pid=${p.id}&run=1`}>
                      {claims.filter((c) => c.patient.id === p.id).length} claims
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

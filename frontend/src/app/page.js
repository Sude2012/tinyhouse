"use client";
import { useState, useEffect } from "react";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5254/api/reservations") // Backend API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setReservations(data); // Verileri set ediyoruz
        setLoading(false); // Yükleme durumunu bitiriyoruz
      })
      .catch((error) => {
        setError(error); // Hata varsa error'ı set ediyoruz
        setLoading(false); // Yükleme durumu biter
      });
  }, []);

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Tiny House Reservations</h1>
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.id} style={{ marginBottom: "1rem" }}>
            <p>
              <strong>Guest:</strong> {reservation.guestName}
            </p>
            <p>
              <strong>House:</strong> {reservation.houseName}
            </p>
            <p>
              <strong>Check-in Date:</strong>{" "}
              {new Date(reservation.checkInDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Check-out Date:</strong>{" "}
              {new Date(reservation.checkOutDate).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reservations;

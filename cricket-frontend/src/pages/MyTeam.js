import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import { extractErrorMessage } from '../utils/errorUtils';

const MyTeam = () => {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [newTeam, setNewTeam] = useState({
    name: '',
    contact_number: '',
    jazzcash_number: ''
  });

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    phone: '',
    role: 'batsman'
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      const teamRes = await api.get('/teams/my-team');

      const myTeams = teamRes.data;

      if (!myTeams || myTeams.length === 0) {
        setTeam(null);
        return;
      }

      // Use first team for now
      const firstTeam = myTeams[0];

      setTeam(firstTeam);

      const playersRes = await api.get(
        `/teams/${firstTeam.id}/players`
      );

      setPlayers(playersRes.data);

    } catch (err) {
      if (err.response?.status === 404) {
        setTeam(null);
      } else {
        setError("Failed to load team data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      await api.post('/teams/', newTeam);

      setShowCreateModal(false);

      setNewTeam({
        name: '',
        contact_number: '',
        jazzcash_number: ''
      });

      fetchTeamData();

    } catch (err) {
      alert(
        extractErrorMessage(
          err.response?.data?.detail,
          "Failed to create team"
        )
      );
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        `/teams/${team.id}/add-player`,
        newPlayer
      );

      setShowAddModal(false);

      setNewPlayer({
        name: '',
        phone: '',
        role: 'batsman'
      });

      fetchTeamData();

    } catch (err) {
      alert(
        extractErrorMessage(
          err.response?.data?.detail,
          "Failed to add player"
        )
      );
    }
  };

  const paySubscription = () => {
    alert(
      "JazzCash Payment Flow Coming Soon...\nSend 250 PKR to our number to continue after trial."
    );
  };

  const roleIcons = {
    batsman: '🏏',
    bowler: '🎯',
    allrounder: '⭐'
  };

  if (loading) {
    return (
      <div className="team-loading-screen">
        <div className="team-loading-spinner"></div>
        <p>Loading your team...</p>

        <style>{`
          .team-loading-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
          }

          .team-loading-spinner {
            width: 45px;
            height: 45px;
            border: 4px solid #ddd;
            border-top: 4px solid #1a2332;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 12px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!team) {
    return (
      <>
        <div className="team-empty-card">
          <div className="team-empty-icon">🏏</div>

          <h2>No Team Found</h2>

          <p>
            You are not leading any team yet.
            Create your cricket team now.
          </p>

          <div className="team-actions">
            <button
              className="team-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus />
              Register Team
            </button>

            <Link to="/join-team" className="team-btn-outline">
              Join Existing Team
            </Link>
          </div>
        </div>

        {showCreateModal && (
          <div
            className="team-modal-overlay"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="team-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="team-modal-header">
                <h3>Create Team</h3>

                <button
                  className="team-close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTeam}>
                <div className="team-modal-body">

                  <div className="team-field">
                    <label>Team Name</label>

                    <input
                      type="text"
                      required
                      value={newTeam.name}
                      onChange={(e) =>
                        setNewTeam({
                          ...newTeam,
                          name: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="team-field">
                    <label>Contact Number</label>

                    <input
                      type="text"
                      required
                      value={newTeam.contact_number}
                      onChange={(e) =>
                        setNewTeam({
                          ...newTeam,
                          contact_number: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="team-field">
                    <label>JazzCash Number</label>

                    <input
                      type="text"
                      value={newTeam.jazzcash_number}
                      onChange={(e) =>
                        setNewTeam({
                          ...newTeam,
                          jazzcash_number: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="team-modal-footer">
                  <button
                    type="button"
                    className="team-btn-outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="team-btn-primary"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .team-empty-card {
            max-width: 500px;
            margin: 80px auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }

          .team-empty-icon {
            font-size: 60px;
            margin-bottom: 20px;
          }

          .team-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 24px;
            flex-wrap: wrap;
          }

          .team-btn-primary {
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            background: #1a2332;
            color: white;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .team-btn-outline {
            padding: 12px 20px;
            border-radius: 10px;
            border: 1px solid #ccc;
            background: white;
            text-decoration: none;
            color: black;
            cursor: pointer;
          }

          .team-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .team-modal {
            background: white;
            width: 100%;
            max-width: 450px;
            border-radius: 16px;
            overflow: hidden;
          }

          .team-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
          }

          .team-close-btn {
            border: none;
            background: none;
            font-size: 24px;
            cursor: pointer;
          }

          .team-modal-body {
            padding: 20px;
          }

          .team-field {
            margin-bottom: 18px;
          }

          .team-field label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
          }

          .team-field input {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #ccc;
          }

          .team-modal-footer {
            padding: 16px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="team-dashboard">

        <div className="team-header">
          <div>
            <h2>👑 {team.name}</h2>

            <p>
              Manage your squad and subscription
            </p>
          </div>

          <span className="team-status">
            {team?.subscription_status === 'trial'
              ? '⏳ Trial'
              : '✅ Active'}
          </span>
        </div>

        {error && (
          <div className="team-error">
            {error}
          </div>
        )}

        <div className="team-grid">

          <div className="team-card">
            <h3>Team Information</h3>

            <div className="team-info">
              <strong>📱 Contact:</strong>
              <span>{team.contact_number || 'Not provided'}</span>
            </div>

            <div className="team-info">
              <strong>💰 JazzCash:</strong>
              <span>{team.jazzcash_number || 'Not provided'}</span>
            </div>

            <div className="team-info">
              <strong>👥 Players:</strong>
              <span>{players.length} / 20</span>
            </div>

            {team?.subscription_status === 'trial' ? (
              <div className="team-trial-box">
                ⏳ Your free 3-month trial is active.
              </div>
            ) : (
              <button
                className="team-btn-primary"
                onClick={paySubscription}
              >
                <FaMoneyBillWave />
                Renew Subscription (250 PKR)
              </button>
            )}
          </div>

          <div className="team-card">
            <div className="team-players-header">
              <h3>Players ({players.length})</h3>

              <button
                className="team-btn-primary"
                onClick={() => setShowAddModal(true)}
                disabled={players.length >= 20}
              >
                <FaPlus />
                Add Player
              </button>
            </div>

            {players.length === 0 ? (
              <div className="team-empty-players">
                No players yet.
              </div>
            ) : (
              <div className="team-players-grid">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="team-player-card"
                  >
                    <div className="team-player-avatar">
                      {roleIcons[player.role] || '🏏'}
                    </div>

                    <div>
                      <div className="team-player-name">
                        {player.name}
                      </div>

                      <div className="team-player-role">
                        {player.role}
                      </div>

                      {player.phone && (
                        <div className="team-player-phone">
                          📞 {player.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div
            className="team-modal-overlay"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="team-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="team-modal-header">
                <h3>Add Player</h3>

                <button
                  className="team-close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddPlayer}>
                <div className="team-modal-body">

                  <div className="team-field">
                    <label>Player Name</label>

                    <input
                      type="text"
                      required
                      value={newPlayer.name}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          name: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="team-field">
                    <label>Phone</label>

                    <input
                      type="text"
                      value={newPlayer.phone}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          phone: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="team-field">
                    <label>Role</label>

                    <select
                      value={newPlayer.role}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          role: e.target.value
                        })
                      }
                    >
                      <option value="batsman">
                        Batsman
                      </option>

                      <option value="bowler">
                        Bowler
                      </option>

                      <option value="allrounder">
                        All Rounder
                      </option>
                    </select>
                  </div>
                </div>

                <div className="team-modal-footer">
                  <button
                    type="button"
                    className="team-btn-outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="team-btn-primary"
                  >
                    Add Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .team-dashboard {
          padding: 24px;
        }

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .team-status {
          background: #1a2332;
          color: white;
          padding: 8px 14px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: bold;
        }

        .team-error {
          background: #ffe5e5;
          color: #b00020;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }

        .team-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .team-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .team-trial-box {
          margin-top: 18px;
          padding: 12px;
          background: #fff3cd;
          border-radius: 10px;
        }

        .team-players-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .team-players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
          gap: 14px;
        }

        .team-player-card {
          display: flex;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #eee;
        }

        .team-player-avatar {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
        }

        .team-player-name {
          font-weight: bold;
        }

        .team-player-role {
          color: #666;
          font-size: 14px;
        }

        .team-player-phone {
          font-size: 13px;
          margin-top: 4px;
        }

        .team-empty-players {
          text-align: center;
          padding: 40px;
          color: #777;
        }

        .team-btn-primary {
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: #1a2332;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
        }

        .team-btn-outline {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
        }

        .team-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .team-modal {
          background: white;
          width: 100%;
          max-width: 450px;
          border-radius: 16px;
          overflow: hidden;
        }

        .team-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }

        .team-close-btn {
          border: none;
          background: none;
          font-size: 24px;
          cursor: pointer;
        }

        .team-modal-body {
          padding: 20px;
        }

        .team-field {
          margin-bottom: 18px;
        }

        .team-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .team-field input,
        .team-field select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
        }

        .team-modal-footer {
          padding: 16px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </>
  );
};

export default MyTeam;
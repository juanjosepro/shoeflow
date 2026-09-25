import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDozens } from "../hooks/useDozens";
import DozenList from "../components/DozenList";
import { useWorkers } from "@/features/workers/hooks/useWorkers";
import MessageInfo from "@/shared/components/MessageInfo";
import { Button } from "primereact/button";

export const DozensPage = () => {
	const { metadata, dozens, loading, fetchDozensMetadata, toggleDozenStatus } = useDozens();
	const { workers } = useWorkers({ noPagination: true });

	useEffect(() => {
		fetchDozensMetadata();
	}, []);

	const groupedByTeamId = useMemo(() => {
		return (workers as any[]).reduce((acc: any, item: any) => {
			const teamId = item.team_id;

			if (!acc[teamId]) {
				acc[teamId] = {
					team_id: item.team_id,
					// Asegúrate de que `item.teams` esté presente si lo usas
					team_name: item.teams ? item.teams.name : 'Unknown Team',
					members: [],
				};
			}

			acc[teamId].members.push(item);

			return acc;
		}, {});
	}, [workers]); // Dependencia: solo recalcular cuando 'workers' cambie

	if (loading) {
		return (
			<div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
				<i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem' }} />
			</div>
		);
	}

	return (
		<>
			{dozens.length === 0 ? (
				<MessageInfo
					title="No hay datos que mostrar"
					intro="Empieza añadiendo tus primeros registros"
				/>
			) : (
				<DozenList
					dozens={dozens}
					metadata={metadata}
					groupedByTeamId={groupedByTeamId}
					toggleDozenStatus={toggleDozenStatus}
				/>
			)}

			<Link to="/dozens/new">
				<Button
					rounded
					size="large"
					severity="success"
					icon="pi pi-plus"
					style={{
						position: "fixed",
						right: 24,
						bottom: 24,
						padding: "1.8rem 1.9rem",
					}}
				/>
			</Link>
		</>
	);
};
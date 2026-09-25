import { useEffect, useState } from 'react'
import MessageInfo from "@/shared/components/MessageInfo";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { ListBox } from 'primereact/listbox';
import dayjs from "@/shared/lib/dayjs";

const DozenByWeeks = ({ isSearching, dozens, handleSelection, type = "dozens" }) => {
  const [groupedDozens, setGroupedDozens] = useState([]);

  useEffect(() => {
    if (!dozens || dozens.length === 0) {
      setGroupedDozens([]);
      return;
    }

    const sorted = [...dozens].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const currentDate = dayjs();
    const result = [];
    const tempGroups = new Map();

    sorted.forEach((item) => {
      const date = dayjs(item.created_at);
      const startOfWeek = date.startOf("isoWeek");
      const endOfWeek = date.endOf("isoWeek");

      const label = `desde <strong>${startOfWeek.format("D [de] MMMM")}</strong> hasta <strong>${endOfWeek.format("D [de] MMMM")}</strong>`;
      const dateKey = startOfWeek.toISOString();

      const weeksDiff = currentDate.startOf("isoWeek").diff(startOfWeek, "week");

      let title;
      if (weeksDiff === 0) title = "Esta semana";
      else if (weeksDiff === 1) title = "Semana pasada";
      else if (weeksDiff === 2) title = "Hace dos semanas";
      else if (weeksDiff === 3) title = "Hace tres semanas";
      else if (weeksDiff === 4) title = "Hace cuatro semanas";
      else if (weeksDiff > 4 && weeksDiff <= 8) title = "Hace más de un mes";
      else title = "Hace más de dos meses";

      if (!tempGroups.has(dateKey)) {
        tempGroups.set(dateKey, { title, label, items: [] });
      }

      tempGroups.get(dateKey).items.push(item);
    });

    Array.from(tempGroups.entries())
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .forEach(([, { title, label, items }]) => {
        result.push({ title, label, items });
      });

    setGroupedDozens(result);

    return () => setGroupedDozens([]);
  }, [dozens]);

  const groupByModel = (items) => {
    const map = new Map();
    for (const item of items) {
      const modelId = item.variant.id;
      const modelName = item.variant.model.name;
      if (!map.has(modelId)) {
        map.set(modelId, { model: modelName, amount: 1 });
      } else {
        map.get(modelId).amount += 1;
      }
    }
    return Array.from(map.values());
  };

  const listBoxBodySection = (dozen) => {
    return (
      <div className="flex align-items-center">
        <div className="flex gap-4 justify-content-between align-items-start w-full">
          <div>
            <h3 className="font-bold uppercase pb-1" style={{ color: '#374151' }}>
              {dozen?.variant?.model?.name}{" "}
              <em className="font-medium capitalize">({dozen?.variant?.size?.name})</em>
            </h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
              <li>
                <p style={{ color: '#4b5563' }}>
                  Codigo: <strong className="uppercase">{dozen?.code}</strong>
                </p>
              </li>
              <li>
                <p style={{ color: '#4b5563' }}>
                  Día de {type === "dozens" ? "registro" : "asignación"}:{" "}
                  <strong className="capitalize">
                    {dayjs(dozen?.created_at).format("dddd")}
                  </strong>
                </p>
              </li>
              <li>
                <p style={{ color: '#4b5563' }} className="capitalize">
                  Material: <strong className="capitalize">{dozen?.material}</strong>
                </p>
              </li>
              <li>
                <div style={{ color: '#4b5563' }} className="capitalize">
                  Estado:{" "}
                  <Chip
                    label={dozen?.status.replace(/_/g, " ")}
                    icon="pi pi-circle-fill"
                    className={`pau-chip-dozen lowercase ${dozen?.status}`}
                  />
                </div>
              </li>
              {dozen?.description && (
                <li>
                  <p style={{ color: '#4b5563' }}>Nota: {dozen?.description}</p>
                </li>
              )}
            </ul>
          </div>
          <i
            className="pi pi-circle-fill pau-circle-shadow"
            style={{ color: dozen?.color, borderRadius: '50%' }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {dozens && dozens.length > 0 ? (
        <Accordion
          multiple
          className="pau-accordion-dozen"
          activeIndex={0}
          expandIcon="pi pi-list-check"
          collapseIcon="pi pi-list-check"
        >
          {groupedDozens.map((dozen, i) => (
            <AccordionTab
              key={i}
              header={
                <span className="flex align-items-start gap-2 w-full">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#374151' }}>
                      {dozen.title}
                    </h3>
                    <p
                      className="pb-3 font-normal"
                      style={{ color: '#374151' }}
                      dangerouslySetInnerHTML={{ __html: dozen.label }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {groupByModel(dozen.items).map((c, i) => (
                        <Chip
                          key={i}
                          label={`${c.model} | ${c.amount}`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#86ff4766',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <Badge
                    value={`Total: ${dozen.items.length}`}
                    className="ml-auto"
                    style={{
                      backgroundColor: 'var(--surface-900)',
                      width: '90px',
                    }}
                  />
                </span>
              }
              className="pau-card-dozen"
            >
              <ListBox
                className="w-full"
                options={dozen.items}
                itemTemplate={listBoxBodySection}
                listStyle={{ maxHeight: 'none' }}
                onChange={handleSelection}
              />
            </AccordionTab>
          ))}
        </Accordion>
      ) : (
        isSearching
          ? <MessageInfo title="Sin coincidencias" intro="No hay registros que coincidan con el código buscado" />
          : <MessageInfo title="No hay datos que mostrar" intro="Empieza añadiendo tus primeros registros" />
      )}
    </>
  );
};

export default DozenByWeeks;
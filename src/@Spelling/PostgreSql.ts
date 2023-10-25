const Spell = {
    select: (table: string, columns: string, prams: Record<string, any>) =>
        `select ${columns} from ${table}`,
    update: (table: string, columns: string, prams: Record<string, any>) =>
        `update ${table} set ${columns}`,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete: (table: string, _column: string, _prams: Record<string, any>) => `delete from ${table}`,
    insert: (table: string, columns: string, prams: Record<string, any>) =>
        `insert into ${table} (${columns}) values ${prams.values.join(" ")}`,
};

export default Spell;
